import { Layout, PageHeader, Tag } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import React, { useState } from 'react';
import './App.css';
import 'antd/dist/antd.min.css'
import { MapDisplay } from './components/MapDisplay';
import DataDisplay from './components/DataDisplay';
import { GithubOutlined } from '@ant-design/icons';
import { GeoJSON} from 'geojson';

function App() {
    const [points, setPoints] = useState<GeoJSON |undefined>()
    const [relations, setRelations] = useState<GeoJSON | undefined>()

  return (
    <div className="App">
    <Layout className="layout">
        <PageHeader 
            title='Geo Gedcom'
            subTitle='Convert your familly tree into an interactive map'
            tags={[<Tag key={'gedcom' } color='cyan'>Gedcom</Tag>,<Tag key={'geojson'} color='green'>Geojson</Tag>]}
        />
        <Content
        style={{
            display:'flex',
            minHeight:'100%',
            height:'100%',
            justifyContent:'space-between',
            padding: '0 50px',
            gap:'10px'
        }}
        >
            <DataDisplay points={points} relations={relations} setPoints={setPoints} setRelations={setRelations}/>
            <MapDisplay points={points} relations={relations}/>
        </Content>
        <Footer
        style={{
            textAlign: 'center',
        }}
        >
        Geo Gedcom 2022 Created by <a href='https://github.com/keldaan-ag'>Keldaan</a>. <a href='https://github.com/keldaan-ag/geo-gedcom'>Open-source project</a>. <a href='https://github.com/keldaan-ag/geo-gedcom'>Star me</a> on <GithubOutlined /> Github
        </Footer>
    </Layout>
    </div>
  );
}

export default App;
