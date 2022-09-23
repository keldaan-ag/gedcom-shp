import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Input, message, Steps, Switch } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { COLORS_32, Gedcom, Individual, Status, StatusDescription } from "../types";
import { RcFile } from "antd/lib/upload";
import { collectPlaces, convertGedcomToJson, geocode, delay, buildPoints, buildRelations, mapIndividuals, mapRelations, computeSosa } from "../geo";
import { GeoJSON } from 'geojson';
import { ShakespeareGed, TudorGed } from '../types/gedcom'
const { Step } = Steps;

export default function DataDisplay(props:{
  points:GeoJSON |undefined,
  relations: GeoJSON |undefined,
  setPoints:Dispatch<SetStateAction<GeoJSON>>,
  setRelations:Dispatch<SetStateAction<GeoJSON>>}){

    const [status, setStatus] = useState<Status>(Status.UPLOAD)
    const [conversionInformations, setConversionInformations] = useState<string>('')
    const [geocodedInformations, setGeocodedInformations] = useState<string>('')
    const [warnings, setWarnings] = useState<Array<string>>([])
    const [error, setError] = useState<string>('')
    const [switchSosa, setSwitchSosa] = useState<boolean>(false)
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')


    function downloadFile(fileName: string, data: GeoJSON){
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const href = URL.createObjectURL(blob);
    
      // create "a" HTLM element with href to file
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName + ".json";
      document.body.appendChild(link);
      link.click();
    
      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    }

    function beforeUpload(file: RcFile, FileList: RcFile[]){
        const reader = new FileReader();

        reader.onload = e => {
            if(e?.target?.result && typeof e.target.result === 'string'){
                message.success(`${file.name} file uploaded successfully.`);
                setStatus(Status.CONVERSION)
                setTimeout(()=>conversion(e.target.result as string), 500)
                
            }
        };
        reader.readAsText(file);
        return false;
    }

    async function conversion(data: string){
      try {
        const gedcom = await convertGedcomToJson(data)
        const locations = collectPlaces(gedcom)
        message.success(`${gedcom.Head.File} converted to JSON successfully`);
        setStatus(Status.GEOCODE)
        setConversionInformations(`${gedcom.Individuals.length} individuals`)
        geocodePlaces(locations, gedcom)
      } catch (err) {
        console.log(err)
        setError(JSON.stringify(err))
      }
    }

    async function geocodePlaces(locations: string[], gedcom: Gedcom){
      const mappedLocations = new Map<string,{latitude: number, longitude: number}>();
      const w = new Array<string>()

      for (let i = 0; i < locations.length; i++) {
          const res: any = await geocode(locations[i])
          await delay(2000)
          
          if(res && res.length > 0 && res[0].lat && res[0].lon){
              setGeocodedInformations(`${i + 1}/${locations.length} ${res[0].display_name}`)
              mappedLocations.set(locations[i],{latitude: parseFloat(res[0].lat), longitude: parseFloat(res[0].lon)})
          }
          else{
            w.push(locations[i])
            setWarnings(w)
            message.warn(`Could not geocode address: ${locations[i]}`)
          }
      }
      message.success(`${mappedLocations.size} locations geocoded successfully`);
      setStatus(Status.CREATION)
      creation(gedcom, mappedLocations)
  }

  function computeColors(individuals: Map<string, Individual>){
    let colorFamily = new Map<string, string>()
    individuals.forEach(individual=>{
      if(individual.Branch && !colorFamily.has(individual.Branch)){
        colorFamily.set(individual.Branch, COLORS_32[colorFamily.size])
      }
    })
    individuals.forEach(individual=>{
      individual.color = colorFamily.has(individual.Branch) ? colorFamily.get(individual.Branch) : "#000"
    })
  }

  function creation(gedcom: Gedcom, mappedLocations: Map<string,{latitude: number, longitude: number}>){
    const mappedIndividuals = mapIndividuals(gedcom)
    const mappedRelations = mapRelations(gedcom)
    if(switchSosa){
      const sosaStartId = gedcom.Individuals.find(i=> i.Fullname.toLowerCase().includes(firstName.toLowerCase()) && i.Fullname.toLowerCase().includes(lastName.toLowerCase()))?.Id
      if(sosaStartId){
          computeSosa(mappedRelations, mappedIndividuals, sosaStartId, 1, 0, '')
          computeColors(mappedIndividuals)
      }
      else{
        setWarnings(['Unable to found individual' + firstName + ' ' + lastName])
      }
    }
    const points = buildPoints(gedcom, mappedLocations, mappedRelations)
    const relations = buildRelations(gedcom, mappedLocations, mappedIndividuals)
    props.setPoints(points)
    props.setRelations(relations)
    setStatus(Status.COMPLETE)
  }

    function onDrop(e: React.DragEvent<HTMLDivElement>){
        setStatus(Status.UPLOAD)
    }


    return <div style={{width:'50%'}}>
    <Divider children={<p>Status</p>} orientation="left"/>
    <Steps current={Object.values(Status).findIndex(v=>v===status)}>
    <Step title="Upload" description="Gedcom loading to page" />
    <Step title="Conversion" description="Conversion from gedcom to json" subTitle={conversionInformations}/>
    <Step title="Geocode" description="Geocode every address" subTitle={geocodedInformations}/>
    <Step title="Creation" description="Create geojson files"/>
  </Steps>
    <p style={{marginTop:'10px'}}>{StatusDescription[status]}</p>
    {warnings.length > 0 ? <Alert
      message="Warning"
      description={`Could not geocode address: ${warnings}`}
      type="warning"
      showIcon
      closable
    /> : null}
    {error.length > 0 ? <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
    />:null }
    <div style={{display:'flex', gap:'20px'}}>
      <div style={{width:'50%'}}>
        <Divider children={<p>Upload</p>} orientation="left"/>
        <Dragger onDrop={onDrop} accept=".ged" beforeUpload={beforeUpload}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload your familly tree</p>
        <p className="ant-upload-hint">.ged only</p>
        </Dragger>

      </div>
      <div style={{width:'50%'}}>
        <Divider children={<p>Options</p>} orientation="left"/>
        <div>
          <div style={{display:'flex', gap:'10px'}}><Switch defaultChecked onChange={setSwitchSosa} checked={switchSosa}/> <p>Compute SOSA number</p></div>
          <div style={{display:'flex', gap:'10px'}}>
            <Input value={firstName} onChange={(e)=>{setFirstName(e.target.value)}} placeholder="First name" prefix={<UserOutlined />} />
            <Input placeholder="Last name" value={lastName} onChange={(e)=>{setLastName(e.target.value)}}  prefix={<UserOutlined />} />
          </div>
        </div>
        <Divider children={<p>Test with famous tree</p>} orientation="left"/>
        <div style={{display:'flex', gap:'10px'}}>
        <Button onClick={()=>{
            setStatus(Status.CONVERSION)
            setTimeout(()=>conversion(ShakespeareGed), 500)
        }}>Shakespeare Family</Button>
                <Button onClick={()=>{
            setStatus(Status.CONVERSION)
            setTimeout(()=>conversion(TudorGed), 500)
        }}>Tudor Royal Family</Button>
        </div>
      </div>

    </div>


  <Divider children={<p>Download</p>} orientation="left"/>
  <p>You can download the generated geoJSON files. Individuals.json will contain points. Relations.json will contain lines.</p>
  <div style={{display:'flex', justifyContent:'space-evenly'}}>
  <Button disabled={props.points === undefined} onClick={()=>{downloadFile('individuals', props.points)}}>Download individuals.json</Button>
  <Button disabled={props.relations === undefined} onClick={()=>{downloadFile('relations', props.relations)}}>Download relations.json</Button>
  </div>
</div> 
}