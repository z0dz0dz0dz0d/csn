from types import new_class
import requests
import numpy as np

token = 'AIzaSyBrVRgddachzL32XdZT8mWf8eix3mF3udw'
api = 'https://content-youtube.googleapis.com/youtube/v3'
operation = '/search'
safe_search = 'strict'

youtube_api_topics_mapping = {
  "Adventures": "/m/02jjt", # Entertainment
  "Alphabet": "/m/01k8wb", # Knowledge
  "Animals": "/m/068hy", # Pets
  "Arts & Crafts": "/m/05qjc", # Performing arts
  "Baby Shark": "/m/02jjt", # Entertainment
  "Business": "/m/09s1f", # Business
  "Cars & Trucks": "/m/07yv9", # Vehicles
  "Challenge": "/m/02jjt", # Entertainment
  "Colors": "/m/01k8wb", # Knowledge
  "Comedy": "/m/09kqc", # Humor
  "Construction": "/m/02jjt", # Entertainment
  "Cooking & Baking": "/m/02wbm", # Food
  "Counting": "/m/09s1f", # Business
  "Daily Routine": "/m/0kt51", # Health
  "Dinosaurs": "/m/068hy", # Pets,
  "Disney": "/m/02jjt", # Entertainment
  "Dragons": "/m/02jjt", # Entertainment
  "Emotions / Feelings": "/m/098wr", # Society
  "English as Second Language": "/m/01k8wb", # Knowledge
  "Excursions & Travel": "/m/07bxq", # Tourism
  "Fairy Tales/Fables": "/m/02jjt", # Entertainment
  "Family": "/m/098wr", # Society
  "Fantasy": "/m/02jjt", # Entertainment
  "Finger Family": "/m/02jjt", # Entertainment
  "Food & Drink": "/m/02wbm", # Food
  "Foreign Language": "/m/01k8wb", # Knowledge
  "Friendship": "/m/098wr", # Society
  "Games & Puzzles": "/m/04q1x3q", # Puzzle video game
  "History": "/m/01k8wb", # Knowledge,
  "Hobbies": "/m/03glg", # Hobby
  "Identity": "/m/098wr", # Society
  "Insects & Spiders": "/m/068hy", # Pets
  "Institutional Channel": "/m/098wr", # Society
  "Jobs & Professions": "/m/098wr", # Society
  "Johnny Johnny": "/m/02jjt", # Entertainment
  "Jokes/Pranks": "/m/09kqc", # Humor
  "Lullaby": "/m/02jjt", # Entertainment
  "Math": "/m/01k8wb", # Knowledge
  "Mindfulness & Yoga": "/m/0kt51", # Health
  "Movement & Dance": "/m/05qjc", # Performing arts
  "Music": "/m/04rlf", # Music
  "Nature": "/m/07bxq", # Tourism
  "Nursery Rhymes": "/m/02jjt", # Entertainment
  "Personality": "/m/098wr", # Society
  "Phonics": "/m/01k8wb", # Knowledge
  "Poetry": "/m/01k8wb", # Knowledge
  "Puppets": "/m/02jjt", # Entertainment
  "Read-along": "/m/01k8wb", # Knowledge
  "Religion": "/m/06bvp", # Religion
  "Robots": "/m/07c1v", # Technology
  "Safety": "/m/0kt51", # Health
  "School": "/m/01k8wb", # Knowledge
  "Science": "/m/01k8wb", # Knowledge
  "Seasonal Holidays": "/m/07bxq", # Tourism
  "Shapes": "/m/01k8wb", # Knowledge
  "Sports": "/m/06ntj", # Sports
  "Super Heroes": "/m/02jjt", # Entertainment
  "Taste Test": "/m/02wbm", # Food
  "Theatre Arts": "/m/05qjc", # Performing arts
  "Time Travel": "/m/02jjt", # Entertainment
  "Toy Playtime": "/m/02jjt", # Entertainment
  "Transportation": "/m/07yv9", # Vehicles
  "Trick Shots": "/m/02jjt", # Entertainment
  "Unboxing": "/m/02jjt", # Entertainment
  "Unicorns": "/m/02jjt", # Entertainment
  "Video Games": "/m/0bzvm2", # gaming,
  "Vocabulary": "/m/01k8wb", # Knowledge
}

# deprecated
def get_youtube_topics(topics):
    youtube_topics = []
    
    for topic in topics:
        youtube_topic = youtube_api_topics_mapping[topic]

        if not youtube_topic in youtube_topics:
            youtube_topics.append(youtube_topic)

    return ','.join(youtube_topics)

def generate_channel(entry, csn_channel_ids):
    channel_id = entry['snippet']['channelId']
    new_to_csn = False if channel_id in csn_channel_ids else True

    return {
        'channel_url': f'https://www.youtube.com/channel/{channel_id}',
        'channel_id': channel_id,
        'title': entry['snippet']['channelTitle'],
        'description': entry['snippet']['description'],
        'thumbnail': entry['snippet']['thumbnails']['default']['url'],
        'new_to_csn': new_to_csn
    }

def generate_video(entry, for_kids_mapping):
    channel_id = entry['snippet']['channelId']
    video_id = entry['id']
    keywords = entry['snippet']['tags'] if 'tags' in entry['snippet'].keys() else None
    for_kids = for_kids_mapping.get(channel_id)
    
    return {
        'channel_url': f'https://www.youtube.com/channel/{channel_id}',
        'channel_id': channel_id,
        'video_url': f'https://www.youtube.com/watch?v={video_id}',
        'video_id': video_id,
        'title': entry['snippet']['title'],
        'description': entry['snippet']['description'],
        'keywords': keywords,
        'for_kids': for_kids
    }

def construct_search_request(type, part, order, region_code, keywords, language, max_results):
    keywords_str = '|'.join(keywords)
    keywords_str = keywords_str.replace('#', '')

    return f'{api}{operation}?type={type}&part={part}&order={order}&regionCode={region_code}&maxResults={max_results}&q={keywords_str}&safeSearch={safe_search}&relevanceLanguage={language}&key={token}'

def dispatch_request(query):
    req = requests.get(query)

    return req.json()['items']

def construct_metadata_request(part, ids):
    ids_str = ','.join(ids)

    return f'https://youtube.googleapis.com/youtube/v3/videos?part={part}&id={ids_str}&key={token}'

def construct_channels_request(part, ids):
    ids_str = ','.join(ids)
 
    return f'https://youtube.googleapis.com/youtube/v3/channels?part={part}&id={ids_str}&key={token}'

def find_youtube_resources(keywords, max_results, resource_type, order_by, topics, csn_channel_ids):
    query = construct_search_request(resource_type, 'snippet', order_by, 'US', np.concatenate((topics, keywords)), 'en', max_results)
    items = dispatch_request(query)

    if resource_type == 'video':
        video_ids = list(map(lambda x: x['id']['videoId'], items))
        channel_ids = list(map(lambda x: x['snippet']['channelId'], items))

        metadata_query = construct_metadata_request('snippet', video_ids)
        items_metadata = dispatch_request(metadata_query)

        channels_query = construct_channels_request('status', channel_ids)
        items_channels = dispatch_request(channels_query)

        for_kids_mapping = {channel['id']:channel['status']['madeForKids'] if 'madeForKids' in channel['status'].keys() else False for channel in items_channels}

        return list(map(lambda x: generate_video(x, for_kids_mapping), items_metadata))
    else:
        return list(map(lambda x: generate_channel(x, csn_channel_ids), items))