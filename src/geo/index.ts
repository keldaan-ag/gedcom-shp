import { Gedcom, Individual, Relation } from '../types'
import { ParsingOptions, JsonParsing } from './gedcom'


export async function convertGedcomToJson(data: string){
    try {
        const parsingOptions = new ParsingOptions();
        parsingOptions.SetText(data)
        const parse = new JsonParsing(parsingOptions)
        const result =  await parse.ParseTextAsync()
        const gedcom = result.Object as Gedcom
        return gedcom
    } catch (error) {
        console.error(error)
        throw new Error(JSON.stringify(error));
    }
}

export function collectPlaces(tree: Gedcom){
    try {
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
            if(relation.Marriage && relation.Marriage !== 'Y'){
                if(Array.isArray(relation.Marriage)){
                    relation.Marriage.forEach(m=>{
                        if(m.Place && !locations.includes(m.Place)){
                            locations.push(m.Place)
                        }
                    })
                }
                else{
                    if(relation.Marriage && relation.Marriage.Place && !locations.includes(relation.Marriage.Place)){
                        locations.push(relation.Marriage.Place)
                    }
                }
            }
        })
        return locations
    } catch (error) {
        console.error(error)
        throw new Error(JSON.stringify(error));
    }
}

export async function delay(milliseconds : number) {
    return new Promise(resolve => setTimeout( resolve, milliseconds));
}



export function geocode(location: string){
    const query = `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
    return fetch(query).then(res=>res.json()).catch(err=>{console.log(err); return err})
}


export function mapIndividuals(gedcom: Gedcom){
    const individuals = new Map<string, Individual>()
    gedcom.Individuals.forEach(i=>{
        individuals.set(i.Id, i)
    })
    return individuals
}

export function mapRelations(gedcom: Gedcom){
    const relations = new Map<string, Relation>()
    gedcom.Relations.forEach(r=>{
        relations.set(r.Id,r)
    })
    return relations
}


export function computeSosa(relations: Map<string,Relation>, individuals: Map<string,Individual>, id: string, sosa: number, gen: number, branch: string){
    const individual = individuals.get(id)
    let familyBranch = branch

    if(individual){
        if(gen === 5){
            familyBranch = individual?.Fullname.split('/')[1]
        }
        if(individual.Relations){
            individual.Sosa = sosa
            individual.Branch = familyBranch
            const parentRelation = getParentRelation(relations, individual)
            if(parentRelation){
                const father = individuals.get(parentRelation.Husband)
                const mother = individuals.get(parentRelation.Wife)
                if(father){
                    computeSosa(relations, individuals, father.Id, 2 * sosa, gen + 1, familyBranch)
                }
                if(mother){
                    computeSosa(relations, individuals, mother.Id, 2 * sosa + 1, gen + 1, familyBranch)
                }
            }
        }
    }
}

function getParentRelation(relations: Map<string,Relation>, individual: Individual){
    let relation: Relation|undefined;
    if(typeof individual.Relations === 'string'){
        let potentialRelation = relations.get(individual.Relations)
        if(potentialRelation && isParentRelation(potentialRelation, individual.Id)){
            relation = potentialRelation
        }
    }
    else{
        individual.Relations.forEach(r=>{
            let potentialRelation = relations.get(r)
            if(potentialRelation && isParentRelation(potentialRelation, individual.Id)){
                relation = potentialRelation
            }
        })
    }
    return relation
}

function isParentRelation(relation: Relation, id: string){
    if(relation.Children){
        if(typeof relation.Children === 'string'){
            return relation.Children === id
        }
        else{
            return relation.Children.includes(id)
        }
    }
    else{
        return false
    }
}


export function buildPoints(gedcom: Gedcom, locations: Map<string,{latitude: number, longitude: number}>){
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
                firstName: individual.Fullname?.split('/')[0],
                name: individual.Fullname?.split('/')[1],
                birthYear: birthDate.getFullYear(),
                birthMonth: birthDate.getMonth(),
                birthDay: birthDate.getDay(),
                deathYear: deathDate.getFullYear(),
                deathMonth: deathDate.getMonth(),
                deathDay: deathDate.getDay(),
                sex: individual.Sex,
                occupation: individual.Occupation,
                id: individual.Id,
                sosa: individual.Sosa,
                branch: individual.Branch
            }
            const feature: GeoJSON.Feature = {geometry: point, properties: properties, type:'Feature'}
            points.features.push(feature)
        }
    })
    return points
}

export function buildLine(fromId: string, toId: string, individuals: Map<string, Individual>, locations: Map<string,{latitude: number, longitude: number}>, type: string){
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

export function buildRelations(gedcom: Gedcom, locations: Map<string,{latitude: number, longitude: number}>, individuals: Map<string, Individual>){
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
