import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from '@ant-design/icons';
import { Button, Checkbox, Descriptions, Divider, message, Steps } from "antd";
import { useState } from "react";
import { Status } from "../types";
import { RcFile } from "antd/lib/upload";
import { convertGedcomToJson } from "../geo";
const { Step } = Steps;

export default function DataDisplay(){
    const plainOptions = ['Birth Year', 'Birth Month', 'Birth Day', 'Death Year', 'Death Month', 'Death Day'];
    const [status, setStatus] = useState<Status>(Status.UPLOAD)


    function onOptionsChange(){

    }

    function beforeUpload(file: RcFile, FileList: RcFile[]){
        const reader = new FileReader();

        reader.onload = e => {
            if(e?.target?.result && typeof e.target.result === 'string'){
                message.success(`${file.name} file uploaded successfully.`);
                setStatus(Status.CONVERSION)
                conversion(e.target.result)
            }
        };
        reader.readAsText(file);
        return false;
    }

    function conversion(data: string){
        const gedcom = convertGedcomToJson(data)
        console.log(gedcom)
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>){
        setStatus(Status.UPLOAD)
    }


    return <div style={{width:'50%'}}>
    <Divider children={<p>Status</p>} orientation="left"/>
    <Steps current={Object.values(Status).findIndex(v=>v===status)}>
    <Step title="Upload" description="Gedcom loading to page" />
    <Step title="Conversion" description="Conversion from gedcom to json" />
    <Step title="Geocode" description="Geocode every address"/>
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


  <Divider children={<p>Results</p>} orientation="left"/>
  <Descriptions title="Family tree #125">
    <Descriptions.Item label="Number of relations">725</Descriptions.Item>
    <Descriptions.Item label="Number of individuals">1320</Descriptions.Item>
    <Descriptions.Item label="Number of geocoded locations">179/180</Descriptions.Item>
  </Descriptions>
  <Divider children={<p>Download</p>} orientation="left"/>
  <div style={{display:'flex', justifyContent:'space-evenly'}}>
  <Button type="primary">Download individuals</Button>
  <Button type="primary">Download relations</Button>
  </div>
</div> 
}