def transform_val_to_boolean(val):
    if val == 'yes':
        return True
    elif val == 'no':
        return False
    else:
        return None

# all elements from slice are contained in list
def is_full_slice_in_list(slice, list):
    return all(item in list for item in slice)

# at least one element from slice is contained in list
def is_partial_slice_in_list(slice, list):
    return any(item in list for item in slice)

def filter_datasets(videos_dataframe, channels_dataframe, age_segments, diversity, learning, positive_messages, classifications, status, topics, filter_by, channel_ids):
    if filter_by == "DLPACS":
        return filter_by_dlpacs(videos_dataframe, channels_dataframe, age_segments, diversity, learning, positive_messages, classifications, status, topics)
    else:
        return filter_by_channel_ids(videos_dataframe, channels_dataframe, channel_ids)

def filter_by_channel_ids(videos_dataframe, channels_dataframe, channel_ids):
    channels_dataframe_filtered = channels_dataframe[channels_dataframe["channel_id"].isin(channel_ids)]
    videos_dataframe_filtered = videos_dataframe[videos_dataframe["channel_id"].isin(channel_ids)]

    return (videos_dataframe_filtered, channels_dataframe_filtered)

def filter_by_dlpacs(videos_dataframe, channels_dataframe, age_segments, diversity, learning, positive_messages, classifications, status, topics):
    def filter_by_channel_index(dataframe, age_segments, is_diversity, is_learning, is_positive_messages, is_full_age_segments_overlap, classifications, status, topics):
        # DLP filter
        if not is_diversity == None:
            dataframe = dataframe[dataframe['is_diversity'] == is_diversity]
        if not is_learning == None:
            dataframe = dataframe[dataframe['is_learning'] == is_learning]
        if not is_positive_messages == None:
            dataframe = dataframe[dataframe['is_positive_messages'] == is_positive_messages]
        
        # age segments filter
        overlap_fn = is_partial_slice_in_list
        if is_full_age_segments_overlap == True:
            overlap_fn = is_full_slice_in_list
        dataframe = dataframe[dataframe['age_segments'].transform(lambda x: overlap_fn(age_segments, list(map(lambda x: x.strip(),x.split(','))))) == True]

        # classification
        if not classifications == 'any':
            dataframe = dataframe[dataframe['channel_classification'].transform(lambda x: is_partial_slice_in_list(classifications, [x])) == True]
            
        # status
        if not status == 'any':
            dataframe = dataframe[dataframe['status'] == status]

        # topics
        if topics:
            def is_topic_in_list(x):
                if x != x:
                    return False

                return is_partial_slice_in_list(topics, list(map(lambda x: x.strip(), x.split(','))))

            dataframe = dataframe[dataframe['channel_topics'].transform(lambda x: is_topic_in_list(x)) == True]

        # sort
        dataframe = dataframe.sort_values(by=['channel_name'])

        return dataframe

    age_segments_overlap = "overlap" in age_segments
    if "overlap" in age_segments:
        age_segments.remove("overlap")

    is_diversity = transform_val_to_boolean(diversity)
    is_learning = transform_val_to_boolean(learning)
    is_positive_messages = transform_val_to_boolean(positive_messages)
    videos_dataframe_filtered = filter_by_channel_index(videos_dataframe.copy(), age_segments, is_diversity, is_learning, is_positive_messages, age_segments_overlap, classifications, status, topics)

    channel_ids = videos_dataframe_filtered['channel_id'].value_counts().index.values
    channels_dataframe_filtered = channels_dataframe[channels_dataframe["channel_id"].isin(channel_ids)]

    return (videos_dataframe_filtered, channels_dataframe_filtered)