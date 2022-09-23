import { Map, GeoJson } from "pigeon-maps"
import { GeoJSON } from 'geojson';

export function MapDisplay(props:{points: GeoJSON, relations: GeoJSON}){

    return (
      <Map height={800} width={900} defaultCenter={[48, 2]} defaultZoom={6}>
      <GeoJson
        data={props.points}
        styleCallback={(feature: GeoJSON.Feature, hover) => {
          if (feature.geometry.type === "LineString") {
            return { strokeWidth: "1", stroke: "black" };
          }
          return {
            fill: feature.properties["color"] ? feature.properties["color"]: "#fff",
            strokeWidth: "1",
            stroke: "white",
            r: "10",
          };
        }}
      />
      <GeoJson
        data={props.relations}
        styleCallback={(feature, hover) => {
          if (feature.geometry.type === "LineString") {
            return { strokeWidth: "1", stroke: "black" };
          }
          return {
            fill: "#1890ff",
            strokeWidth: "1",
            stroke: "white",
            r: "10",
          };
        }}
      />
    </Map>
    )
}