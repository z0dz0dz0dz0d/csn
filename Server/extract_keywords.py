import random 
import numpy as np
import pandas as pd
import re
from difflib import SequenceMatcher

# extract all keywords from video
def extract_video_keywords(keyword_groups):
  keywords = []
  for group in keyword_groups:
    words = group.split(',')

    for keyword in words:
      keywords.append(keyword)
    
  return keywords

def extract_channel_keywords(channels_df):

    channel_keyword_groups = channels_df['keywords'].values

    channel_keywords = []
    for group in channel_keyword_groups:
        if group != group:
          continue

        space_keywords = re.sub(r'(["\'])(?:(?=(\\?))\2.)*?\1', '', group)
        keywords = re.findall(r'"(.*?)"', group)

        for key in space_keywords.split(' '):
            if len(key) > 0:
                keywords.append(key)
        
        for keyword in keywords:
            channel_keywords.append(keyword)

    return channel_keywords



def get_most_frequent_keywords(keywords, max_words):
  df_keywords = pd.Series(keywords)
  
  return df_keywords.value_counts()[:max_words].index.values.tolist()

def get_random_keywords(series, max_words, in_first_words):
  df_keywords = pd.Series(series)[:in_first_words]

  all_keywords = df_keywords.value_counts().index.values
  keywords = []
  for i in range(0, max_words):    
    rand_index = random.randint(0, len(all_keywords) - 1)
    keyword = all_keywords[rand_index]
    np.delete(all_keywords, rand_index, 0)
    keywords.append(keyword)

  return keywords

MAX_SIMILARITY_PERCENTAGE = 0.6

def get_random_weighted_keywords( dataset_keywords, max_words, in_first_words ):
  series = pd.Series( dataset_keywords )
  all_keywords = series.value_counts().index.values[:in_first_words]
  
  # storage for extracted keywords
  saved_keywords = []

  # list of keywords to be manually processed
  contains_keywords = {
    "lego": False
  }

  # generate relative weights for random
  weights = [ *map( lambda x: x * 10 + 10, [ *range( len( all_keywords ) ) ] ) ]
  weights.reverse()

  # processing keywords
  while ( len( saved_keywords ) < max_words and len( all_keywords ) > 0 ):
    # get random weighted keyword
    keyword = random.choices( all_keywords, weights=weights, k=1 )[0]
    weights.pop()
    all_keywords = all_keywords[ all_keywords != keyword ]    
    lower_keyword = keyword.lower()

    # add keyword to stored keywords
    add_to_stored = True
    # skip similarity check if a keyword was manually processed against contains_keywords
    skip_similarity_check = False

    # processing keyword based on contains_keyword
    contains_keywords_keys = contains_keywords.keys()
    for contain_keyword in contains_keywords_keys:
      # if keyword is in contains_keywords
      if contain_keyword in lower_keyword:
        skip_similarity_check = True

        # first occurance of keyword from contains_keywords list
        if contains_keywords[ contain_keyword ] == False:
          contains_keywords[ contain_keyword ] = True
          keyword = contain_keyword
        # n-th occurance of keyword from contains_keywords list
        else:
          add_to_stored = False

    # processing keywords based on similarity
    if not skip_similarity_check:
      for saved_keyword in saved_keywords:
        ratio = SequenceMatcher( None, lower_keyword, saved_keyword.lower() ).ratio()
        # if simliarity between currently processed keywords and previously stored keywords is > MAX_SIMILARITY_PERCENTAGE then flag it as invalid
        if ratio > MAX_SIMILARITY_PERCENTAGE:
          add_to_stored = False
          break

    # store keyword if it passed all checks
    if add_to_stored:
      saved_keywords.append( keyword )

  return saved_keywords

def extract_keywords(videos_df, channels_df, source, algorithm, keywords_num, keywords_from):
    videos_df_copy = videos_df.copy()
    channels_df_copy = channels_df.copy()

    if source == 'videos':
        keywords = extract_video_keywords(videos_df_copy['video_keywords'].dropna().values)
    else:
        keywords = extract_channel_keywords(channels_df_copy)

    if algorithm == 'random':
        extracted_keywords = get_random_keywords(keywords, keywords_num, keywords_from)
    elif algorithm == 'randomWeighted':
        extracted_keywords = get_random_weighted_keywords(keywords, keywords_num, keywords_from)
    else:
        extracted_keywords = get_most_frequent_keywords(keywords, keywords_num)

    return extracted_keywords