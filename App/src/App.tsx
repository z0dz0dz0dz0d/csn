import React from 'react';
import { Button, Box, FormControlLabel, RadioGroup, Radio, Grid, FormGroup, Checkbox, TextField, Select, MenuItem, Tooltip, Tabs, Tab, AppBar } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import styled from 'styled-components'
import axios from 'axios';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/react";
import { writeFile, utils } from 'xlsx';
// @ts-ignore
import { parse } from 'json2csv';

const TOPICS = [
  "Adventures",
  "Alphabet",
  "Animals",
  "Arts & Crafts",
  "Baby Shark",
  "Business",
  "Cars & Trucks",
  "Challenge",
  "Colors",
  "Comedy",
  "Construction",
  "Cooking & Baking",
  "Counting",
  "Daily Routine",
  "Dinosaurs",
  "Disney",
  "Dragons",
  "Emotions / Feelings",
  "English as Second Language",
  "Excursions & Travel",
  "Fairy Tales/Fables",
  "Family",
  "Fantasy",
  "Finger Family",
  "Food & Drink",
  "Foreign Language",
  "Friendship",
  "Games & Puzzles",
  "History",
  "Hobbies",
  "Identity",
  "Insects & Spiders",
  "Institutional Channel",
  "Jobs & Professions",
  "Johnny Johnny",
  "Jokes/Pranks",
  "Lullaby",
  "Math",
  "Mindfulness & Yoga",
  "Movement & Dance",
  "Music",
  "Nature",
  "Nursery Rhymes",
  "Personality",
  "Phonics",
  "Poetry",
  "Puppets",
  "Read-along",
  "Religion",
  "Robots",
  "Safety",
  "School",
  "Science",
  "Seasonal Holidays",
  "Shapes",
  "Sports",
  "Super Heroes",
  "Taste Test",
  "Theatre Arts",
  "Time Travel",
  "Toy Playtime",
  "Transportation",
  "Trick Shots",
  "Unboxing",
  "Unicorns",
  "Video Games",
  "Vocabulary"
];

const override = css`
  position: absolute;
  right: 0;
  top: 10px;
`;

const Comp = styled.div`
  background-color: #a5bff2;;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  padding-top: 30px;
`;

const Title = styled.div`
  text-align: center;
  margin-bottom: 30px;
  font-size: 30px;
`;

const Section = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
`;

const RadioOptions: React.FC<{ value: string, tooltip: string, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, title: string, options: { label: string, value: string }[] }> = ({ title, options, tooltip, onChange, value }) => {
  return (
    <div>
      <Tooltip title={tooltip}>
        <div>{title}</div>
      </Tooltip>
      <RadioGroup aria-label="gender" name="gender1" onChange={onChange} value={value}>
        {options.map(({ label, value }, key) => (<FormControlLabel key={key} value={value} control={<Radio />} label={label} />))}
      </RadioGroup>
    </div>
  );
}

const CheckboxOptions: React.FC<{ values: string[], tooltip: string; horizontal?: boolean, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, title: string, options: { label: string, value: string }[] }> = ({ onChange, title, tooltip, options, values, horizontal }) => {  return (
    <div>
      <Tooltip title={tooltip}>
        <div>{title}</div>
      </Tooltip>
      <FormGroup style={horizontal ? { flexDirection: 'row', justifyContent: 'center' } : undefined}>
        {options.map(({ label, value }, key) => (
          <FormControlLabel
            key={key}
            control={<Checkbox name={label} checked={values.includes(value)} onChange={onChange} value={value} />}
            label={label}
          />
        ))}
      </FormGroup>
    </div>
  );
}

interface MLStrategy {
  name: string;
  title: number;
  description: number;
  keywords: number;
}
interface VideoResourcePreview {
  videoId: string;
  title: string;
  isForKids: string;
  description: string;
  keywords: string[];
  strategies: MLStrategy[];
}
interface VideoResourcePreviewOptions {
  showTitle: boolean;
  showForKids: boolean;
  showId: boolean;
  showDescription: boolean;
  showKeywords: boolean;
  showMedia: boolean;
  showStrategies: string[];
}
const VideoResource: React.FC<{ preview: VideoResourcePreview, options: VideoResourcePreviewOptions }> = ({ preview, options }) => (
  <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', textAlign: "center", marginBottom: "100px", marginLeft: '50px', marginRight: '50px'}}>
    {options.showId && 
      (<div>
        <div style={{ fontSize: '10px' }}>ID</div>
        <div style={{ marginBottom: "15px" }}>{preview.videoId}</div>
      </div>
    )}    

    {options.showMedia && (
      <iframe width="250" height="250" src={`https://www.youtube.com/embed/${preview.videoId}`}></iframe>
    )}
    
    {options.showForKids && 
      (<div>
        <div style={{ fontSize: '10px' }}>CHANNEL - DESIGNATED FOR KIDS</div>
        <div style={{ marginBottom: "15px" }}>{preview.isForKids ? 'True' : 'False'}</div>
      </div>
    )}
    
    {options.showTitle && 
      (<div>
        <div style={{ fontSize: '10px' }}>TITLE</div>
        <div style={{ marginBottom: "15px" }}>{preview.title}</div>
      </div>
    )}    

    {options.showDescription && 
      (<div>
        <div style={{ fontSize: '10px' }}>DESCRIPTION</div>
        <div style={{ marginBottom: "15px", maxWidth: "300px", maxHeight: "300px", overflow: "auto", marginLeft: "auto", marginRight: "auto" }}>{preview.description}</div>
      </div>
    )}

    {options.showKeywords && 
      (<div>
        <div style={{ fontSize: '10px' }}>KEYWORDS</div>
        {preview.keywords && preview.keywords.length ? (
          <ul style={{ maxHeight: "200px", maxWidth: "200px", overflow: "auto", textAlign: 'center', margin: 'auto', marginBottom: '30px' }}>
            {preview.keywords?.map((keyword) => (<li style={{ display: 'block list-item', marginRight: '10px' }}>{keyword}</li>))}
          </ul>) : 
        "None"}
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {preview.strategies.filter((strategy) => options.showStrategies.includes(strategy.name.toLowerCase())).map((strategy) => (
        <div style={{ marginLeft: "50px", marginRight: "50px" }}>
          <div style={{ fontSize: '10px' }}>NAME</div>
          <div style={{ marginBottom: "15px" }}>{strategy.name}</div>

          {options.showTitle && 
            (<>
              <div style={{ fontSize: '10px' }}>TITLE</div>
              <div style={{ marginBottom: "15px" }}>{strategy.title}</div>
            </>
          )}
          {options.showDescription && 
            (<>
              <div style={{ fontSize: '10px' }}>DESCRIPTION</div>
              <div style={{ marginBottom: "15px" }}>{strategy.description}</div>
            </>
          )}
          {options.showKeywords && 
            (<>
              <div style={{ fontSize: '10px' }}>KEYWORDS</div>
              <div style={{ marginBottom: "15px" }}>{strategy.keywords}</div>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
)

const Datasets = () => {
  const { addToast } = useToasts();
  const [uploadableFile, setUploadableFile] = React.useState<File | null>(null);
  const [datasetType, setDatasetType] = React.useState<string>("videos");
  const [diversityValue, setDiversityValue] = React.useState<string>("any");
  const [learningValue, setLearningValue] = React.useState<string>("any");
  const [messagesValue, setMessagesValue] = React.useState<string>("any");
  const [retrieveCSNDataset, setRetrieveCSNDataset] = React.useState<boolean>(false);
  const [ageValues, setAgeValue] = React.useState<string[]>(["2-4", "5-7", "8-10", "11-12"]);
  const [classificationValue, setClassificationValue] = React.useState<string>("any");
  const [statusValue, setStatusValue] = React.useState<string>("any");
  const [keywordsSource, setKeywordsSource] = React.useState<string>("videos");
  const [keywordsAlgorithm, setKeywordsAlgorithm] = React.useState<string>("mostFrequent");  
  const [keywordsNum, setKeywordsNum] = React.useState<number>(15);
  const [keywordsFromPoolNum, setKeywordsFromPoolNum] = React.useState<number>(40);  
  const [videosDataset, setVideosDataset] = React.useState<string | null>(null);
  const [channelsDataset, setChannelsDataset] = React.useState<string | null>(null);
  const [datasets, setDatasets] = React.useState<{ videos: string[], channels: string[] }>({ videos: [], channels: [] });
  const [maxResultsNum, setMaxResultsNum] = React.useState<number>(50);
  const [orderBy, setOrederBy] = React.useState<string>("relevance");
  const [resourceType, setResourceType] = React.useState<string>("video");
  const [resources, setResources] = React.useState<{resourceType: "video" | "channel", resources: any[], keywords: string[], filteredVideosDataset: any[], filteredChannelsDataset: any[]} | null>(null)
  const [isUploadingDataset, setIsUploadingDataset] = React.useState<boolean>(false);
  const [isRetrievingResources, setIsRetrievingResources] = React.useState<boolean>(false);
  const [topics, setTopics] = React.useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = React.useState<string[]>([]);
  const [tabView, setTabView] = React.useState<number>(0);
  const [channelsFromDataset, setChannelsFromDataset] = React.useState<{channel_id: string, channel_name: string}[]>([])
  const [selectedChannels, setSelectedChannels] = React.useState<{channel_id: string, channel_name: string}[]>([])
  const [resourceMetadataAttributes, setResourceMetadataAttributes] = React.useState<string[]>(["title", "description", "keywords", "media", "id", "forKids"]);
  const [mlStrategy, setMLStrategy] = React.useState<string[]>(["embeddings", "bert"]);

  const getDatasets = () => {
    axios.get('https://csn-channel-index.com:8000/datasets').then(({data}) => {
      const datasets = data.data;
      setDatasets(datasets);
    })
  }

  const getChannelsFromDataset = (dataset: string) => {
    setSelectedChannels([])
    axios.get('https://csn-channel-index.com:8000/channels-from-dataset', { params: { dataset } }).then(({data}) => {
      const channels = data.data.channels;
      setChannelsFromDataset(channels)
    })
  }

  React.useEffect(() => {
    getDatasets();
  }, []);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;

    const file = target.files?.[0] || null;
    setUploadableFile(file);
  }

  const onUploadClick = () => {
    if (!uploadableFile) {
      return;
    }

    setIsUploadingDataset(true);

    const data = new FormData();
    data.append('file', uploadableFile);
    data.append('datasetType', datasetType);

    axios.post('https://csn-channel-index.com:8000/upload-dataset', data).then(({data}) => {
      if (!data.successful) {
        addToast('File Does not match proper format', { appearance: 'error', autoDismiss: true });
      } else {
        addToast('File Uploaded Successfully', { appearance: 'success', autoDismiss: true });
        getDatasets();
      }

      setIsUploadingDataset(false);
      // hack so that file input does not open
      setTimeout(() => {
        setUploadableFile(null);
      }, 10);
    });
  }

  const onRetrieveResourcesClick = () => {
    if (!videosDataset || !channelsDataset) {
      addToast('You must select videos & channels dataset', { appearance: 'error', autoDismiss: true });
      return
    }
    
    if (tabView === 1 && selectedChannels.length < 1) {
      addToast('You must select channels', { appearance: 'error', autoDismiss: true });
      return
    }
    

    let filter = null

    if (tabView === 0) {
      filter = {
        filterBy: "DLPACS",         
        diversity: diversityValue,
        learning: learningValue,
        messages: messagesValue,
        classification: classificationValue,
        status: statusValue,
        age: ageValues,
        topics,
      }
    } else {
      filter = {
        filterBy: "channels",
        channels: selectedChannels.map(({channel_id}) => channel_id),
        topics
      }
    }

    const payload = {
      datasets: {
        videos: videosDataset,
        channels: channelsDataset,
        retrieveFiltered: retrieveCSNDataset,
      },
      filter,
      keywords: {
        source: keywordsSource,
        algorithm: keywordsAlgorithm,
        keywords: {
          num: keywordsNum,
          from: keywordsFromPoolNum,
          manually_appended: manualKeywords
        }
      },
      youtube: {
        order: orderBy,
        resource: resourceType,
        maxResults: maxResultsNum
      }
    }
    
    setIsRetrievingResources(true);
    axios.post('https://csn-channel-index.com:8000/find-similar-resources', payload).then(({data}) => {
      const resources = data.data
      
      setIsRetrievingResources(false);
      setResources(resources)

    });
  }

  const getCsv = (resources: any, keywords: string[]) => {
    if (!resources || !resources[0]) {
      return null;
    }

    try {
      const entry = resources[0];
      const fields = [...Object.keys(entry), "extracted_keywords"];
      const opts = { fields }

      if (resources.length >= keywords.length) {
        resources = resources.map((resource: any, key: number) => ({ ...resource, extracted_keywords: key < keywords.length ? keywords[key] : null }))
      } else {
        resources[0].extracted_keywords = keywords
      }

      return parse(resources, opts)
    } catch {}

    return null
  }

  const handleDiversityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setDiversityValue(value);
  }  
  
  const handleLearningChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setLearningValue(value);
  }  
  
  const handleMessagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setMessagesValue(value);
  }  
  
  const handleClassificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setClassificationValue(value);
  }
  
  const handleOrderByChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setOrederBy(value);
  }    
  
  const handleResourceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setResourceType(value);
  }  
  
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setStatusValue(value);
  }    
  
  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setKeywordsSource(value);
  }    
  
  const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    setKeywordsAlgorithm(value);
  }    
  
  const handleDatasetTypeChange = (event: React.ChangeEvent<{ name?: any, value: any }>) => {
    const { target } = event;
    const value = target.value;
    setDatasetType(value);
  }    
  
  const handleKeyowrdsNumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = parseInt(target.value, 10);
    setKeywordsNum(value);
  }    
  
  const handleKeywordsFromPoolNumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = parseInt(target.value);
    setKeywordsFromPoolNum(value);
  }  
  
  const handleRetrieveDataset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const checked = target.checked;

    setRetrieveCSNDataset(checked);
  }

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const checked = target.checked;

    let newAgeValues = [...ageValues];
    if (checked) {
      newAgeValues.push(value);
    } else {
      newAgeValues = newAgeValues.filter((age) => age !== value);
    }
    setAgeValue(newAgeValues);
  }  
  
  const handleMetadataAttributesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const checked = target.checked;

    let newMetadataAttributes = [...resourceMetadataAttributes];
    if (checked) {
      newMetadataAttributes.push(value);
    } else {
      newMetadataAttributes = newMetadataAttributes.filter((metadata) => metadata !== value);
    }
    setResourceMetadataAttributes(newMetadataAttributes);
  }  
  
  const handleMLStrategyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const checked = target.checked;

    let newMLStrategy = [...mlStrategy];
    if (checked) {
      newMLStrategy.push(value);
    } else {
      newMLStrategy = newMLStrategy.filter((strategy) => strategy !== value);
    }
    setMLStrategy(newMLStrategy);
  }

  const handleTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = target.value;
    const checked = target.checked;

    let newTopicValues = [...topics];
    if (checked) {
      newTopicValues.push(value);
    } else {
      newTopicValues = newTopicValues.filter((topic) => topic !== value);
    }
    setTopics(newTopicValues);
  }

  const handleVideosDatasetChange = (event: React.ChangeEvent<{ name?: any, value: any }>) => {
    const { target } = event;
    const value = target.value;
    setVideosDataset(value);
  }    

  const handleChannelsDatasetChange = (event: React.ChangeEvent<{ name?: any, value: any }>) => {
    const { target } = event;
    const value = target.value;
    setChannelsDataset(value);
  }

  const handleMaxResultsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = parseInt(target.value, 10);
    setMaxResultsNum(value);
  }    

  const downloadFile = (dataset: any[], name: string) => {
    const wb = utils.book_new();
    const sheet = utils.json_to_sheet(dataset);
    utils.book_append_sheet(wb, sheet, "test_sheet");
    writeFile(wb, `${name}.xlsx`);
  }

  const handleManualKeywordsChange = (_: any, val: any,) => {
    setManualKeywords(val)
  }  
  
  const handleChannelsSelectionChange = (_: any, val: any,) => {
    setSelectedChannels(val)
  }

  const handleTabChange = (e: any, newVal: any) => {
    setTabView(newVal)
  }

  React.useEffect(() => {
    if (tabView !== 1 || !channelsDataset) {
      return
    }

    getChannelsFromDataset(channelsDataset)
  }, [tabView, channelsDataset])

  const getFiltersName = () => `${diversityValue === "yes" ? "D" : ""}${learningValue === "yes" ? "L" : ""}${messagesValue === "yes" ? "P" : ""}${classificationValue !== "any" ? classificationValue.toUpperCase() : ""}${ageValues.map((age) => age.split("-")[0]).join("")}${statusValue !== "any" ? statusValue : ""}${topics.join("-")}`  

  const resourcesFiltersName = React.useMemo(() => getFiltersName(), [resources?.keywords])

  return (
    <Comp>
      <Section>
        <Tooltip title="Upload videos / channels dataset in CSV format. Videos dataset must contain attributes: 'role_models_and_representations', 'channel_name', 'educational_subjects', 'educational_values', 'messages', 'age_range' and 'video_keywords'. Channels dataset must contain attributes: 'channel_name', 'classification' and 'keywords'">
          <Title>Dataset upload</Title>
        </Tooltip>
        <Select
          style={{ margin: "auto", marginBottom: "10px", width: "150px" }}
          onChange={handleDatasetTypeChange}
          value={datasetType}
        >
          <MenuItem value="videos">Videos</MenuItem>
          <MenuItem value="channels">Channels</MenuItem>
        </Select>
        <div style={{ position: "relative", display: "flex", margin: "auto", width: "200px" }}>
          <Button
            variant="contained"
            component="label"
            style={{ margin: 'auto', marginBottom: '10px' }}
            onClick={onUploadClick}
            disabled={isUploadingDataset}
          >
            {uploadableFile ? 'Upload File' : 'Select File'}
            {!uploadableFile && (
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={onFileChange}
              />
            )}
          </Button>
          <ClipLoader color="#ffffff" loading={isUploadingDataset} css={override} size={15} />
        </div>
        <div style={{ marginLeft: '5px', textAlign: "center" }}>File name: <i>{uploadableFile ? uploadableFile.name : 'N/A'}</i></div>
      </Section>
      <AppBar position="static" style={{ marginBottom: 50 }}>
        <Tabs centered onChange={handleTabChange} value={tabView}>
          <Tab label="By filters" />
          <Tab label="By channels" />
        </Tabs>
      </AppBar>
      <Section>
        <Tooltip title="Datasets used for processing">
          <Title>Dataset selection</Title>
        </Tooltip>
        <Grid container spacing={10}>
          <Grid item xs={6}>
            <div>Videos dataset</div>
            <Select
              style={{ marginBottom: "10px", width: "250px" }}
              onChange={handleVideosDatasetChange}
              value={videosDataset}
            >
              {datasets.videos.map((name, key) => <MenuItem key={key} value={name}>{name}</MenuItem>)}
            </Select>
          </Grid>          
          <Grid item xs={6}>
            <div>Channels dataset</div>
            <Select
              style={{ marginBottom: "10px", width: "250px" }}
              onChange={handleChannelsDatasetChange}
              value={channelsDataset}
            >
              {datasets.channels.map((name, key) => <MenuItem key={key} value={name}>{name}</MenuItem>)}
            </Select>
          </Grid>
        </Grid>
      </Section>
      {tabView === 0 && (
        <Section>
          <Tooltip title="Set of filters that are used to filter CSN datasets">
            <Title>DLPACS filter</Title>
          </Tooltip>
          <Grid container spacing={10}>
            <Grid item xs={2}>
              <RadioOptions title="Diversity" tooltip="Whether a channel is tagged with Diversity tag" value={diversityValue} onChange={handleDiversityChange} options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Any", value: "any" }]}/>
            </Grid>
            <Grid item xs={2}>
              <RadioOptions title="Learning" tooltip="Whether a channel is tagged with Learning tag" value={learningValue} onChange={handleLearningChange}  options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Any", value: "any" }]}/>
            </Grid>
            <Grid item xs={2}>
              <RadioOptions title="Messages" tooltip="Whether a channel is tagged with Positive Messages tag" value={messagesValue} onChange={handleMessagesChange}  options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Any", value: "any" }]}/>
            </Grid>       
            <Grid item xs={2}>
              <CheckboxOptions title="Age" tooltip="Age segments a channel is tagged with" values={ageValues} onChange={handleAgeChange}  options={[{ label: "2-4", value: "2-4" }, { label: "5-7", value: "5-7" }, { label: "8-10", value: "8-10" }, { label: "11-12", value: "11-12" }, { label: "Overlap", value: "overlap" }]}/>
            </Grid>            
            <Grid item xs={2}>
              <RadioOptions title="Classification" tooltip="Classification a channel is tagged with" value={classificationValue} onChange={handleClassificationChange}  options={[{ label: "A", value: "A" }, { label: "B", value: "B" }, { label: "C", value: "C" }, { label: "Any", value: "any" }]}/>
            </Grid>            
            <Grid item xs={2}>
              <RadioOptions title="Status" tooltip="Including approved / rejected videos" value={statusValue} onChange={handleStatusChange}  options={[{ label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }, { label: "Any", value: "any" }]}/>
            </Grid>
          </Grid>
        </Section>
      )}
      {tabView === 1 && (
        <Section>
          <Tooltip title="Channels used for processing">
            <Title>Channels selection</Title>
          </Tooltip>
          <Autocomplete
            multiple
            options={channelsFromDataset}
            getOptionLabel={(option) => option.channel_name}
            value={selectedChannels}            
            onChange={handleChannelsSelectionChange}
            style={{width: 300}}
            renderInput={(params) => (
              <TextField
                style={{width: 300}}
                {...params}
                variant="standard"
                label="Channels"
                
              />
            )}
          />
        </Section>
      )}
      <Section>
        <Tooltip title={tabView === 0 ? 'Topics that are used to filter CSN datasets and to construct a YouTube search query' : 'Topics that are used to construct a YouTube search query'}>
          <Title>Topics</Title>
        </Tooltip>
        <Grid container spacing={10} style={{ width: "70%", margin: "auto" }}>
          <CheckboxOptions title="" tooltip="" values={topics} onChange={handleTopicChange} horizontal={true} options={TOPICS.map((topic) => ({ label: topic, value: topic }))}/>
        </Grid>
      </Section>
      <Section>
        <Tooltip title="Keywords extraction configuration. Keywords are constructed with OR operator">
          <Title>Keywords extraction</Title>
        </Tooltip>
        <Grid container spacing={10}>
          <Grid item xs={3}>
            <RadioOptions title="Source" tooltip="Where are keywords extracted from" value={keywordsSource} onChange={handleSourceChange} options={[{ label: "Videos", value: "videos" }, { label: "Channels", value: "channels" }]}/>
          </Grid>          
          <Grid item xs={3}>
            <RadioOptions title="Algorithm" tooltip="Algorithm applied for keywords extraction" value={keywordsAlgorithm} onChange={handleAlgorithmChange} options={[{ label: "Most frequent", value: "mostFrequent" }, { label: "Random", value: "random" }, { label: "Random weighted (+ clean-up logic for similarities)", value: "randomWeighted" }]}/>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Keywords"
              onChange={handleKeyowrdsNumChange}
              type="number"
              value={keywordsNum}
              style={{ width: "150px", marginBottom: "10px" }}
              InputLabelProps={{
                shrink: true,
              }}
            />            
            <TextField
              label="From pool"
              onChange={handleKeywordsFromPoolNumChange}
              style={{ width: "150px" }}
              value={keywordsFromPoolNum}
              disabled={!["random", "randomWeighted"].includes(keywordsAlgorithm)}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Autocomplete
              multiple
              id="tags-standard"
              options={[]}
              value={manualKeywords}
              freeSolo
              onChange={handleManualKeywordsChange}
              style={{width: 300}}
              renderInput={(params) => (
                <TextField
                  style={{width: 300}}
                  {...params}
                  variant="standard"
                  label="Manual keywords"
                  
                />
              )}
            />
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Tooltip title="YouTube search API configuration">
          <Title>YouTube API</Title>
        </Tooltip>
        <Grid container spacing={10}>
          <Grid item xs={4}>
            <RadioOptions title="Order by" tooltip="Resources order parameter" value={orderBy} onChange={handleOrderByChange}  options={[{ label: "Relevance", value: "relevance" }, { label: "Rating", value: "rating" }, { label: "Date", value: "date" }, { label: "View count", value: "viewCount" }, { label: "Title", value: "title" }, { label: "Video count", value: "videoCount" }]}/>
          </Grid>
          <Grid item xs={4}>
            <RadioOptions title="Resource type" tooltip="Type of a resource to be returned from the API" value={resourceType} onChange={handleResourceTypeChange} options={[{ label: "Video", value: "video" }, { label: "Channel", value: "channel" }]}/>
          </Grid>
          <Grid item xs={4}>
            <TextField
                label="Max results"
                onChange={handleMaxResultsChange}
                style={{ width: "150px" }}
                value={maxResultsNum}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
              />
          </Grid>
        </Grid>
      </Section>
        <CheckboxOptions title="" tooltip="" values={[retrieveCSNDataset ? "csnDataset" : ""]} onChange={handleRetrieveDataset} options={[{ label: "Retrive CSN dataset", value: "csnDataset" }]}/>
        <div style={{ position: "relative", display: "flex", margin: "auto", width: "350px" }}>
          <Button
            variant="contained"
            component="label"
            style={{ margin: 'auto', marginBottom: '10px' }}
            onClick={onRetrieveResourcesClick}
            disabled={isRetrievingResources}
          >
            Retrieve look-a-like resources
          </Button>
          <ClipLoader color="#ffffff" loading={isRetrievingResources} css={override} size={15} />
        </div>
        {!isRetrievingResources && resources && (
          <>
            <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(getCsv(resources.resources, resources.keywords))}`} download={`resources-${resourcesFiltersName}.csv`}>
              <Button
                variant="contained"
                component="label"
                style={{ margin: 'auto', marginBottom: '10px' }}
              >
                Download Resources
              </Button>
            </a>            
            <Button
              variant="contained"
              component="label"
              style={{ margin: 'auto', marginBottom: '10px' }}
              disabled={!resources.filteredVideosDataset}
              onClick={() => downloadFile(resources.filteredVideosDataset, `videos-dataset-${resourcesFiltersName}`)}
            >
              Download Videos Filtered dataset
            </Button>
            <Button
              variant="contained"
              component="label"
              style={{ margin: 'auto', marginBottom: '10px' }}
              disabled={!resources.filteredChannelsDataset}
              onClick={() => downloadFile(resources.filteredChannelsDataset, `channels-dataset-${resourcesFiltersName}`)}
            >
              Download Channels Filtered dataset
            </Button>
            {resources.resourceType === "video" && (
              <Section>
                <Tooltip title="What metadata of resource to show">
                  <Title>Resource preview</Title>
                </Tooltip>
                <Grid container spacing={10}>
                  <Grid item xs={6}>
                    <CheckboxOptions title="ML Strategy" tooltip="ML strategy used for classification" values={mlStrategy} onChange={handleMLStrategyChange}  options={[{ label: "Embeddings", value: "embeddings" }, { label: "BERT (NLP)", value: "bert" }]}/>
                  </Grid>
                  <Grid item xs={6}>
                    <CheckboxOptions title="Metadata" tooltip="Metadata attributes to preview" values={resourceMetadataAttributes} onChange={handleMetadataAttributesChange}  options={[{ label: "Id", value: "id" }, { label: "Title", value: "title" }, { label: "Description", value: "description" }, { label: "Keywords", value: "keywords" }, {label: "Media", value: "media"}, {label: "For kids", value: "forKids"}]}/>
                  </Grid>
                </Grid>
              </Section>
            )}
            <Section>
              <Tooltip title="Keywords in white are extracted from CSN datasets, while keywords in red are topics">
                <Title>Resources</Title>
              </Tooltip>
              <ul style={{ width: "500px", textAlign: 'center', margin: 'auto', marginBottom: '30px' }}>
                {resources.keywords.map((keyword) => (<li style={{ display: 'inline list-item', marginRight: '10px' }}>{keyword}</li>))}
                {topics.map((keyword) => (<li style={{ color: 'red', display: 'inline list-item', marginRight: '10px' }}>{keyword}</li>))}
                {manualKeywords.map((keyword) => (<li style={{ color: 'green', display: 'inline list-item', marginRight: '10px' }}>{keyword}</li>))}
              </ul>

              {resources.resourceType === "video" ? (
                <div>
                  {resources.resources.map((resource, key) => (
                    <VideoResource key={key} preview={{title: resource.title, description: resource.description, keywords: resource.keywords, isForKids: resource.for_kids, videoId: resource.video_id, strategies: resource.strategies}} options={{ showTitle: resourceMetadataAttributes.includes("title"), showDescription: resourceMetadataAttributes.includes("description"), showKeywords: resourceMetadataAttributes.includes("keywords"), showMedia: resourceMetadataAttributes.includes("media"), showStrategies: mlStrategy, showId: resourceMetadataAttributes.includes("id"), showForKids: resourceMetadataAttributes.includes("forKids") }} />
                  ))}
                </div>  
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {resources.resources.map((resource, key) => (
                    <div key={key} style={{ width: '250px', margin: '15px' }}>
                      <img width={150} src={resource.thumbnail} />
                      <div><b>Title:</b> {resource.title}</div>
                      <div><b>Description:</b> {resource.title}</div>
                      <div><b>New to CSN:</b> {resource.new_to_csn ? "Yes" : "No"}</div>
                      <a href={resource.channel_url} target="_blank" rel="noreferrer">Open link</a>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
    </Comp>
  )
}

const App = () => {  
  return (
    <ToastProvider>
      <Datasets />
    </ToastProvider>
  );
}

export default App;
