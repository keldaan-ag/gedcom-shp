
import { JsonParsing, ParsingOptions } from "gedcom.json";
import { Gedcom, Individual } from '../types'


export function convertGedcomToJson(data: string){
    const parsingOptions = new ParsingOptions();
    parsingOptions.SetText(data)
    const parse = new JsonParsing(parsingOptions)
    const gedcom =  parse.ParseText().Object as Gedcom
    return gedcom
}

export function collectPlaces(tree: Gedcom){
    const locations = new Array<string>()
    tree.Individuals.forEach(individual => {
        if(individual.Birth?.Place && !locations.includes(individual.Birth.Place)){
            locations.push(individual.Birth.Place)
        }
        if(individual.Death?.Place && !locations.includes(individual.Death.Place)){
            locations.push(individual.Death.Place)
        }
    })
    tree.Relations.forEach(relation => {
        if(relation.Marriage !== 'Y'){
            if(Array.isArray(relation.Marriage)){
                relation.Marriage.forEach(m=>{
                    if(m.Place && !locations.includes(m.Place)){
                        locations.push(m.Place)
                    }
                })
            }
            else{
                if(relation.Marriage.Place && !locations.includes(relation.Marriage.Place)){
                    locations.push(relation.Marriage.Place)
                }
            }
        }
    })
    return locations
}

async function delay(milliseconds : number) {
    return new Promise(resolve => setTimeout( resolve, milliseconds));
}

export async function geocodePlaces(locations: string[]){
    const locationsMap = new Map<string,{latitude: number, longitude: number}>();
    for (let i = 0; i < locations.length; i++) {
        const res: any = await geocode(locations[i])
        await delay(2000)
        
        if(res && res.length > 0 && res[0].lat && res[0].lon){
            console.log(`${i}/${locations.length} ${res[0].display_name}`)
            locationsMap.set(locations[i],{latitude: parseFloat(res[0].lat), longitude: parseFloat(res[0].lon)})
        }
    }
    return locationsMap
}

function geocode(location: string){
    const query = `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
    return fetch(query).then(res=>res.json()).catch(err=>{console.log(err); return err})
}


function mapIndividuals(gedcom: Gedcom){
    const individuals = new Map<string, Individual>()
    gedcom.Individuals.forEach(i=>{
        individuals.set(i.Id, i)
    })
    return individuals
}

function buildPoints(gedcom: Gedcom, locations: Map<string,{latitude: number, longitude: number}>){
    const points: GeoJSON.GeoJSON = {
        "type": "FeatureCollection",
        "features": []
      }
    gedcom.Individuals.forEach(individual=>{
        if(individual?.Birth?.Place && locations.has(individual.Birth.Place)){
            const location = locations.get(individual.Birth.Place)
            const point: GeoJSON.Point = {type: 'Point', coordinates: [location!.longitude, location!.latitude]}
            const birthDate: Date = new Date(individual.Birth?.Date?.Value)
            const deathDate: Date = new Date(individual.Death?.Date?.Value)

            const properties: GeoJSON.GeoJsonProperties = {
                firstName: individual.Fullname.split('/')[0],
                name: individual.Fullname.split('/')[1],
                birthYear: birthDate.getFullYear(),
                birthMonth: birthDate.getMonth(),
                birthDay: birthDate.getDay(),
                deathYear: deathDate.getFullYear(),
                deathMonth: deathDate.getMonth(),
                deathDay: deathDate.getDay(),
                sex: individual.Sex,
                occupation: individual.Occupation,
                id: individual.Id
            }
            const feature: GeoJSON.Feature = {geometry: point, properties: properties, type:'Feature'}
            points.features.push(feature)
        }
    })
    return points
}

function buildLine(fromId: string, toId: string, individuals: Map<string, Individual>, locations: Map<string,{latitude: number, longitude: number}>, type: string){
    let line: GeoJSON.LineString | undefined;
    let properties: GeoJSON.GeoJsonProperties | undefined;
    let feature: GeoJSON.Feature | undefined;
    const to = individuals.get(toId)
    const from = individuals.get(fromId)
    const fromPlace = from?.Birth?.Place
    const toPlace = to?.Birth?.Place
    if(toPlace && fromPlace){
        const location = locations.get(fromPlace)
        const toLocation = locations.get(toPlace)
        if(location && toLocation){
            line = {type: "LineString", coordinates: [[location.longitude, location.latitude], [toLocation.longitude, toLocation.latitude]]}
            properties = {
                from: from.Fullname,
                to: to.Fullname,
                type: type
            }
            feature = {geometry: line, properties: properties, type:'Feature'}
        }
    }
    return feature
}

function buildRelations(gedcom: Gedcom, locations: Map<string,{latitude: number, longitude: number}>, individuals: Map<string, Individual>){
    const relations: GeoJSON.GeoJSON = {
        "type": "FeatureCollection",
        "features": []
    }
    gedcom.Relations.forEach(relation=>{
        if(relation.Children){
            if( typeof relation.Children === 'string'){
                const husbandLine = buildLine(relation.Husband, relation.Children, individuals, locations, 'father-child')
                const wifeLine = buildLine(relation.Wife, relation.Children, individuals, locations, 'mother-child')
                if(husbandLine){
                    relations.features.push(husbandLine)
                }
                if(wifeLine){
                    relations.features.push(wifeLine)
                }
            }
            else{
                relation.Children.forEach(id=>{
                    const husbandLine = buildLine(relation.Husband,id, individuals, locations, 'father-child')
                    const wifeLine = buildLine(relation.Wife, id, individuals, locations, 'mother-child')
                    if(husbandLine){
                        relations.features.push(husbandLine)
                    }
                    if(wifeLine){
                        relations.features.push(wifeLine)
                    }
                })
            }
        }
        if(relation.Marriage){
            if(relation.Marriage !== 'Y'){
                const line = buildLine(relation.Husband, relation.Wife, individuals, locations, 'marriage')
                if(line){
                    relations.features.push(line)
                }
            }
        }
    })
    return relations
}

async function main(){

    //const locations = collectPlaces(gedcom)
    //const mappedLocations = await geocodePlaces(locations)
    //const mappedIndividuals = mapIndividuals(gedcom)
    //const points = buildPoints(gedcom, mappedLocations)
    //const relations = buildRelations(gedcom, mappedLocations, mappedIndividuals)
    //fs.writeFileSync('examples/points.geojson', JSON.stringify(points))
    //fs.writeFileSync('examples/lines.geojson', JSON.stringify(relations))
}
