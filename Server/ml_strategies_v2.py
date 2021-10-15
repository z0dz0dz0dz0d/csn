import tensorflow as tf
import tensorflow_hub as hub

embeddings_by_title = './models/embeddings_by_video_title.h5'
embeddings_by_keywords = './models/embeddings_by_video_keywords.h5'
embeddings_by_description = './models/embeddings_by_video_description.h5'

embeddings_by_title_model = tf.keras.models.load_model(embeddings_by_title, custom_objects={'KerasLayer':hub.KerasLayer})
embeddings_by_keywords_model = tf.keras.models.load_model(embeddings_by_keywords, custom_objects={'KerasLayer':hub.KerasLayer})
embeddings_by_description_model = tf.keras.models.load_model(embeddings_by_description, custom_objects={'KerasLayer':hub.KerasLayer})

def classify_embeddings_by_title(title):
    prediction = embeddings_by_title_model.predict([title])
    predicted_value = int(tf.math.round(prediction[0][0]))

    return f'{predicted_value} ({prediction[0][0]})'
    
def classify_embeddings_by_description(description):
    prediction = embeddings_by_description_model.predict([description])
    predicted_value = int(tf.math.round(prediction[0][0]))

    return f'{predicted_value} ({prediction[0][0]})'
    
def classify_embeddings_by_keywords(keywords):
    if keywords == None:
        return "N/A"
    
    keywords_str = " ".join(keywords)
    prediction = embeddings_by_keywords_model.predict([keywords_str])
    predicted_value = int(tf.math.round(prediction[0][0]))

    return f'{predicted_value} ({prediction[0][0]})'

def derive_embeddings(video):
    return {
        'name': 'Embeddings',
        'title': classify_embeddings_by_title(video["title"]),
        'description': classify_embeddings_by_description(video["description"]),
        'keywords': classify_embeddings_by_keywords(video["keywords"]),
    }

def derive_bert(video):
    return {
        'name': 'BERT',
        'title': 0,
        'description': 1,
        'keywords': 1,
    }

def derive_classifications(video):
    strategies = [derive_embeddings(video), derive_bert(video)]
    video["strategies"] = strategies

    return video

def extend_videos_with_ml(videos):
    return list(map(derive_classifications, videos))