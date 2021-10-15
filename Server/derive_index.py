import pandas as pd

def derive_index_videos_based(videos_dataframe):
    # generate Diversity, Learning & Positive Messages parameters for the dataset

    AGGREGATE_CLASSIFICATION_THRESHOLD = 60

    # diversity parameter
    DIVERSITY_PARAM_ROLE_MODELS = ['Diversity']

    def video_has_diversity_tag(role_models_and_representations):
        role_models_and_representations = str(role_models_and_representations)

        if not "nan" in role_models_and_representations:
            if any(item in role_models_and_representations for item in DIVERSITY_PARAM_ROLE_MODELS):
              return True

        return False

    videos_dataframe['has_diversity_tag'] = videos_dataframe['role_models_and_representations'].apply(video_has_diversity_tag)
    videos_dataframe['diversity_percentage'] = videos_dataframe.groupby('channel_name')['has_diversity_tag'].transform('sum') / videos_dataframe.groupby('channel_name')['channel_name'].transform('count') * 100
    videos_dataframe['is_diversity'] = videos_dataframe['diversity_percentage'] >= AGGREGATE_CLASSIFICATION_THRESHOLD

    # learning parameter
    def video_has_learning_tag(attrs):
        educational_subjects, educational_values = attrs.values
        educational_subjects = str(educational_subjects)
        educational_values = str(educational_values)

        if not "nan" in educational_subjects or not "nan" in educational_values:
            return True
        
        return False

    videos_dataframe['has_learning_tag'] = videos_dataframe[['educational_subjects', 'educational_values']].apply(video_has_learning_tag, axis=1)
    videos_dataframe['learning_percentage'] = videos_dataframe.groupby('channel_name')['has_learning_tag'].transform('sum') / videos_dataframe.groupby('channel_name')['channel_name'].transform('count') * 100
    videos_dataframe['is_learning'] = videos_dataframe['learning_percentage'] >= AGGREGATE_CLASSIFICATION_THRESHOLD

    # positive messages parameter
    POSITIVE_MESSAGES_PARAM_MESSAGES = ['Themes in line', 'Consequences for poor behavior', 'Pro-social values']
    POSITIVE_MESSAGES_PARAM_ROLE_MODELS = ['Counter-stereotypes', 'Emotional regulation', 'Good choices modeled', 'Positive, friendly interactions', 'Responsible adults/caregivers', 'Social emotional skills']

    def video_has_positive_messages_tag(attrs):
        messages, role_models_and_representations = attrs.values
        messages = str(messages)
        role_models_and_representations = str(role_models_and_representations)

        if not "nan" in messages:
            if any(item in messages for item in POSITIVE_MESSAGES_PARAM_MESSAGES):
                return True

        if not "nan" in role_models_and_representations:
            if any(item in role_models_and_representations for item in POSITIVE_MESSAGES_PARAM_ROLE_MODELS):
                return True

        return False

    videos_dataframe['has_positive_messages_tag'] = videos_dataframe[['messages', 'role_models_and_representations']].apply(video_has_positive_messages_tag, axis=1)
    videos_dataframe['positive_messages_percentage'] = videos_dataframe.groupby('channel_name')['has_positive_messages_tag'].transform('sum') / videos_dataframe.groupby('channel_name')['channel_name'].transform('count') * 100
    videos_dataframe['is_positive_messages'] = videos_dataframe['positive_messages_percentage'] >= AGGREGATE_CLASSIFICATION_THRESHOLD

    # age segment parameter
    AGE_SEGMENT_THRESHOLD = 30

    def calc_age_range(x):
        age_segments_threshold_hit = (x.value_counts(normalize=True) * 100) >= AGE_SEGMENT_THRESHOLD
        age_segments = age_segments_threshold_hit[age_segments_threshold_hit == True]
        age_segments_list = age_segments.index.tolist()

        return ",".join(age_segments_list)

    videos_dataframe["age_segments"] = videos_dataframe.groupby('channel_name')['age_range'].transform(calc_age_range)

    # topics parameter
    TOPICS_THRESHOLD = 30

    def get_topics_list(topic_groups):
        topics = []
        for group in topic_groups:
            group_topics = group.split(',')

            for topic in group_topics:
                topics.append(topic)

        return topics

    def calc_topics(topic_groups):
        videos_num = len(topic_groups)
        topics = get_topics_list(topic_groups)
        topics_series = pd.Series(topics)
        
        topics_threshold_hit = (topics_series.value_counts() / videos_num) * 100 >= TOPICS_THRESHOLD
        selected_topics = topics_threshold_hit[topics_threshold_hit == True]
        topics_list = selected_topics.index.tolist()
        
        return ",".join(topics_list)

    videos_dataframe["channel_topics"] = videos_dataframe.groupby('channel_name')['topic'].transform(calc_topics)

    return videos_dataframe

def derive_index_channel_based(videos_dataframe, channel_classifications_dataframe):
    # append channel classification to videos

    def get_channel_classification_by_name(name):
        classification = channel_classifications_dataframe.loc[channel_classifications_dataframe['channel_name'] == name]['classification']

        if classification.size > 0:
            return classification.values[0]

        return ''

    videos_dataframe["channel_classification"] = videos_dataframe["channel_name"].transform(get_channel_classification_by_name)

    # derive classification from channel and apply to videos

    def derive_video_classification(attrs):
        channel_classification, video_has_positive_messages_tag, video_has_learning_tag, video_has_diversity_tag, channel_is_diversity, channel_is_learning, channel_is_positive_messages = attrs.values

        if channel_classification == 'A':
            return channel_classification

        # return B or C classification only if video index == channel index
        if channel_classification == 'B' or channel_classification == 'C':
            if not video_has_positive_messages_tag != channel_is_positive_messages or video_has_learning_tag != channel_is_learning or video_has_diversity_tag != channel_is_diversity:
                return "" 
            return channel_classification

        return ""

    videos_dataframe['video_classification'] = videos_dataframe[['channel_classification', 'has_positive_messages_tag', 'has_learning_tag', 'has_diversity_tag', 'is_diversity', 'is_learning', 'is_positive_messages']].apply(derive_video_classification, axis=1)

    def get_index_from_video(channel_name):
        videos = videos_dataframe.loc[videos_dataframe['channel_name'] == channel_name]
        if videos.shape[0] == 0:
            return ""

        video = videos.iloc[0]

        is_diversity = "D" if video["is_diversity"] else ""
        is_learning = "L" if video["is_learning"] else ""
        is_positive_messages = "P" if video["is_positive_messages"] else ""
        age_segments = video["age_segments"].split(',')
        age_segments_initials = list(map(lambda str: str[0], age_segments))
        age_segments_str = ''.join(age_segments_initials)

        return f'{age_segments_str}{is_diversity}{is_learning}{is_positive_messages}'

    channel_classifications_dataframe['index'] = channel_classifications_dataframe['channel_name'].apply(get_index_from_video)

    return (videos_dataframe, channel_classifications_dataframe)