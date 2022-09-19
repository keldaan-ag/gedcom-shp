import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from '@ant-design/icons';
import { Button, Checkbox, Descriptions, Divider, Steps } from "antd";
const { Step } = Steps;


export default function DataDisplay(){
    const plainOptions = ['Birth Year', 'Birth Month', 'Birth Day', 'Death Year', 'Death Month', 'Death Day'];

    function onOptionsChange(){

    }

    return <div style={{width:'50%'}}>
    <Dragger>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload your familly tree</p>
    <p className="ant-upload-hint">.gedcom only</p>
  </Dragger>
  <Divider children={<p>Result Fields</p>} orientation="left"/>
  <Checkbox.Group options={plainOptions} defaultValue={['Birth Year', 'Death Year']} onChange={onOptionsChange} />
  <Divider children={<p>Status</p>} orientation="left"/>
  <Steps current={1}>
    <Step title="Upload" description="Gedcom loading to page" />
    <Step title="Conversion" description="Conversion from gedcom to json" />
    <Step title="Geocode" description="Geocode every address"/>
    <Step title="Creation" description="Create geojson files"/>
  </Steps>
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