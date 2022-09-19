import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from '@ant-design/icons';
import { Button, Checkbox, Descriptions, Divider, message, Steps } from "antd";
import { Dispatch, SetStateAction, useState } from "react";
import { Gedcom, Status } from "../types";
import { RcFile } from "antd/lib/upload";
import { collectPlaces, convertGedcomToJson, geocode, delay, buildPoints, buildRelations, mapIndividuals } from "../geo";
import { GeoJSON } from 'geojson';
const { Step } = Steps;

export default function DataDisplay(props:{setPoints:Dispatch<SetStateAction<GeoJSON>>, setRelations:Dispatch<SetStateAction<GeoJSON>>}){
    const plainOptions = ['Birth Year', 'Birth Month', 'Birth Day', 'Death Year', 'Death Month', 'Death Day'];
    const [status, setStatus] = useState<Status>(Status.UPLOAD)
    const [conversionInformations, setConversionInformations] = useState<string>('')
    const [geocodedInformations, setGeocodedInformations] = useState<string>('')

    function onOptionsChange(){

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
        const gedcom = await convertGedcomToJson(data)
        const locations = collectPlaces(gedcom)
        message.success(`${gedcom.Head.File} converted to JSON successfully`);
        setStatus(Status.GEOCODE)
        setConversionInformations(`${gedcom.Individuals.length} individuals`)
        geocodePlaces(locations, gedcom)
    }

    async function geocodePlaces(locations: string[], gedcom: Gedcom){
      const mappedLocations = new Map<string,{latitude: number, longitude: number}>();
      for (let i = 0; i < locations.length; i++) {
          const res: any = await geocode(locations[i])
          await delay(2000)
          
          if(res && res.length > 0 && res[0].lat && res[0].lon){
              setGeocodedInformations(`${i}/${locations.length} ${res[0].display_name}`)
              mappedLocations.set(locations[i],{latitude: parseFloat(res[0].lat), longitude: parseFloat(res[0].lon)})
          }
      }
      message.success(`${mappedLocations.size} locations geocoded successfully`);
      setStatus(Status.CREATION)
      creation(gedcom, mappedLocations)
  }

  function creation(gedcom: Gedcom, mappedLocations: Map<string,{latitude: number, longitude: number}>){
    const mappedIndividuals = mapIndividuals(gedcom)
    const points = buildPoints(gedcom, mappedLocations)
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
    <Divider children={<p>Upload</p>} orientation="left"/>
    <Dragger onDrop={onDrop} accept=".ged" beforeUpload={beforeUpload}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload your familly tree</p>
    <p className="ant-upload-hint">.ged only</p>
  </Dragger>
  <Divider children={<p>Options</p>} orientation="left"/>
  <Checkbox.Group options={plainOptions} defaultValue={['Birth Year', 'Death Year']} onChange={onOptionsChange} />

  <Divider children={<p>Download</p>} orientation="left"/>
  <div style={{display:'flex', justifyContent:'space-evenly'}}>
  <Button type="primary">Download individuals</Button>
  <Button type="primary">Download relations</Button>
  </div>
</div> 
}