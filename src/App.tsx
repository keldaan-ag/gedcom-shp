import { Layout, PageHeader, Tag } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import React from 'react';
import './App.css';
import 'antd/dist/antd.min.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapDisplay } from './components/MapDisplay';
import DataDisplay from './components/DataDisplay';

function App() {
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
            <DataDisplay/>
            <MapDisplay/>
        </Content>
        <Footer
        style={{
            textAlign: 'center',
        }}
        >
        Geo Gedcom 2022 Created by Keldaan
        </Footer>
    </Layout>
    </div>
  );
}

export default App;
