from cerberus import Validator

schemaCompute = {
    'datasets': {'type': 'dict', 'required': True, 'schema': {
        'videos': {'type': 'string', 'required': True},
        'channels': {'type': 'string', 'required': True},
        'retrieveFiltered': {'type': 'boolean', 'required': True},
    }},
    'filter': {'type': 'dict', 'required': True, 'schema': {
        'filterBy': {'type': 'string', 'required': True, 'allowed': ['DLPACS', 'channels']},
        'channels': {'type': 'list'},
        'diversity': {'type': 'string', 'allowed': ['yes', 'no', 'any']},
        'learning': {'type': 'string', 'allowed': ['yes', 'no', 'any']},
        'messages': {'type': 'string', 'allowed': ['yes', 'no', 'any']},
        'classification': {'type': 'string', 'allowed': ['A', 'B', 'C', 'any']},
        'status': {'type': 'string', 'allowed': ['approved', 'rejected', 'any']},
        'age': {'type': 'list', 'allowed': ['2-4', '5-7', '8-10', '11-12', 'overlap']},
        'topics': {'type': 'list'}
    }},
    'keywords': {'type': 'dict', 'required': True, 'schema': {
        'source': {'type': 'string', 'required': True, 'allowed': ['videos', 'channels']},
        'algorithm': {'type': 'string', 'required': True, 'allowed': ['mostFrequent', 'random', 'randomWeighted']},
        'keywords': {'type': 'dict', 'required': True, 'schema': {
            'num': {'type': 'number', 'required': True},
            'from': {'type': 'number'},
            'manually_appended': {'type': 'list'}
        }}
    }},
    'youtube': {'type': 'dict', 'required': True, 'schema': {
        'order': {'type': 'string', 'required': True, 'allowed': ['relevance', 'rating', 'date', 'viewCount', 'title', 'videoCount']},
        'resource': {'type': 'string', 'required': True, 'allowed': ['video', 'channel']},
        'maxResults': {'type': 'number', 'required': True},
    }},
}

validator_compute = Validator(schemaCompute)