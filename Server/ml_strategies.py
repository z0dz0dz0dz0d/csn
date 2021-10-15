def derive_bert(video):
    return {
        'name': 'BERT',
        'title': 0,
        'description': 1,
        'keywords': 1,
    }

def derive_embeddings(video):
    return {
        'name': 'Embeddings',
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