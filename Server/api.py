from flask import Flask, request
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import os
import pandas as pd
import json
from validate import validator_compute
from derive_index import derive_index_videos_based, derive_index_channel_based
from filter_videos_dataset import filter_datasets
from extract_keywords import extract_keywords
from youtube_api import find_youtube_resources
from ml_strategies import extend_videos_with_ml
from flask_compress import Compress

app = Flask(__name__)
Compress(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def contains_all_items(expected_items, items):
    return all(item in items for item in expected_items)

videos_dataset_cols = ['role_models_and_representations', 'channel_name', 'educational_subjects', 'educational_values', 'messages', 'age_range', 'video_keywords', 'channel_id']
def is_proper_videos_dataset(columns):
    return contains_all_items(videos_dataset_cols, columns)
    
channels_dataset_cols = ['channel_name', 'classification', 'keywords', 'channel_id']
def is_proper_channels_dataset(columns):
    return contains_all_items(channels_dataset_cols, columns)

dataset_validation = {
    'videos': is_proper_videos_dataset,
    'channels': is_proper_channels_dataset
}

@app.route('/upload-dataset', methods=['POST'])
@cross_origin()
def upload_dataset():
    # get file
    file = request.files['file']
    dataset_type = request.form.get('datasetType')
    file_name = secure_filename(file.filename)

    # store file
    dir_name = os.path.dirname(__file__)
    file_dir = os.path.join(dir_name, f'datasets/{dataset_type}')
    destination = "/".join([file_dir, file_name])
    file.save(destination)

    # validate dataset
    df = pd.read_csv(destination)
    cols = df.columns.values
    dataset_validation_fn = dataset_validation[dataset_type]
    is_valid = dataset_validation_fn(cols)
    if not is_valid:
        os.remove(destination)

    if dataset_type == "videos":
        indexed_videos_df = derive_index_videos_based(df)
        indexed_videos_df.to_csv(destination, index=False)

    if is_valid:
        return { 'successful': True }
    else:
        return { 'successful': False, 'msg': 'Invalid csv columns' }
        
@app.route('/datasets', methods=['GET'])
@cross_origin()
def get_datasets():
    dir_name = os.path.dirname(__file__)
    videos_dir = os.path.join(dir_name, 'datasets/videos')
    channels_dir = os.path.join(dir_name, 'datasets/channels')

    videos = [f for f in os.listdir(videos_dir)]
    channels = [f for f in os.listdir(channels_dir)]
    
    return { 'successful': True, 'data': {
        'videos': videos,
        'channels': channels
    }}
    
@app.route('/channels-from-dataset', methods=['GET'])
@cross_origin()
def get_channels_from_dataset():
    channels_dataset_name = request.args.get('dataset')

    dir_name = os.path.dirname(__file__)
    channels_dir = os.path.join(dir_name, 'datasets/channels')
    channels_df = pd.read_csv("/".join([channels_dir, channels_dataset_name]))

    channels = json.loads(channels_df[['channel_id', 'channel_name']].to_json(orient = "records"))
    
    return { 'successful': True, 'data': {
        'channels': channels
    }}
    
@app.route('/find-similar-resources', methods=['POST'])
@cross_origin()
def find_similar_resources():
    content = request.json
    if not validator_compute.validate(content):
        return {"successful": False,  "msg": validator_compute.errors}

    filter_by = content['filter']['filterBy']

    # load datasets
    serve_filtered_datasets = content['datasets']['retrieveFiltered']
    videos_dataset_name = content['datasets']['videos']
    channels_dataset_name = content['datasets']['channels']
    dir_name = os.path.dirname(__file__)
    videos_dir = os.path.join(dir_name, 'datasets/videos')
    channels_dir = os.path.join(dir_name, 'datasets/channels')
    videos_df = pd.read_csv("/".join([videos_dir, videos_dataset_name]))
    channels_df = pd.read_csv("/".join([channels_dir, channels_dataset_name]))

    # get channel ids
    channel_ids = channels_df['channel_id'].value_counts().index.values

    # derive index
    if filter_by == "DLPACS":
        (videos_df, channels_df) = derive_index_channel_based(videos_df, channels_df)

    # filter
    channel_ids = content['filter']['channels'] if "channels" in content['filter'] else None
    diversity = content['filter']['diversity'] if "diversity" in content['filter'] else None
    learning = content['filter']['learning'] if "learning" in content['filter'] else None
    messages = content['filter']['messages'] if "messages" in content['filter'] else None
    age = content['filter']['age'] if "age" in content['filter'] else None
    classification = content['filter']['classification'] if "classification" in content['filter'] else None
    status = content['filter']['status'] if "status" in content['filter'] else None
    topics = content['filter']['topics']
    (videos_df, channels_df) = filter_datasets(videos_df, channels_df, age, diversity, learning, messages, classification, status, topics, filter_by, channel_ids)

    # extract keywords
    source = content['keywords']['source']
    algorithm = content['keywords']['algorithm']
    keywords_num = content['keywords']['keywords']['num']
    keywords_from_num = content['keywords']['keywords']['from']
    keywords_manually_appended = content['keywords']['keywords']['manually_appended']
    extracted_keywords = extract_keywords(videos_df, channels_df, source, algorithm, keywords_num, keywords_from_num)
    keywords = keywords_manually_appended + extracted_keywords if keywords_manually_appended else extracted_keywords

    # send API request
    max_results = content['youtube']['maxResults']
    resource_type = content['youtube']['resource']
    order_by = content['youtube']['order']
    resources = find_youtube_resources(keywords, max_results, resource_type, order_by, topics, channel_ids)

    if resource_type == "video":
        resources = extend_videos_with_ml(resources)

    return {"successful": True, 'data': {
        'resourceType': resource_type,
        'resources': resources,
        'keywords': extracted_keywords,
        'filteredVideosDataset': json.loads(videos_df.to_json(orient = "records")) if serve_filtered_datasets == True else None,
        'filteredChannelsDataset': json.loads(channels_df.to_json(orient = "records")) if serve_filtered_datasets == True else None
    }}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8001')
