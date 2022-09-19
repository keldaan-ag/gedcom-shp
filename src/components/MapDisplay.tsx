import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

export function MapDisplay(){
    const map = useRef<undefined | maplibregl.Map>(undefined);
    const [lng] = useState(2);
    const [lat] = useState(47);
    const [zoom] = useState(5);

    useEffect(() => {
        if (map.current) return;
        map.current = new maplibregl.Map({
          container: 'map',
          style: `https://demotiles.maplibre.org/style.json`,
          center: [lng, lat],
          zoom: zoom
        });
      });

    return (
        <div className="map-wrap">
          <div className="map" id='map'/>
        </div>
    )
}