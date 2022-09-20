export enum Status {
    UPLOAD='Upload',
    CONVERSION='Conversion',
    GEOCODE='Geocode',
    CREATION='Creation',
    COMPLETE='Complete'
}

export const StatusDescription: {[key in Status]: string} = {
    Upload: 'Drag and drop and .ged to start creating the map. .ged is the usual extension for family tree export.',
    Conversion: 'Convert the the .ged to a readable format for browser (JSON).',
    Geocode: 'Transform all the different addresses that the familily tree contain into geographical coordinates. Due to openstreetmap restrictions on free geocoding, a 2s pause is needed between every address',
    Creation: 'Create geoJSON files based on the given family tree and the given options.',
    Complete: 'You can see the result on the map. You can also download the geoJSON files. Those files can be read be any GIS software (like QGIS or ArcGIS).'
}

export interface Corporation {
    Value: string;
    Address: string;
}

export interface Source {
    Name: string[];
    Version: string;
    Corporation: Corporation;
    Data: string;
}

export interface GedcomDate {
    Original: string;
    HasYear: boolean;
    HasMonth: boolean;
    HasDay: boolean;
    Value: Date;
}

export interface Gedcom {
    Version: string;
    Format: string;
}

export interface Head {
    Source: Source;
    Date: GedcomDate;
    File: string;
    Gedcom: Gedcom;
    Characters: string;
}

export interface Notes {
    Id: string;
}

export interface Birth {
    Date: GedcomDate;
    Place?: string;
    Source: Source;
    Notes: Notes;
}

export interface Residence {
    Date: GedcomDate;
    Place?: string;
}

export interface Events {
    Type: string[];
    Date: GedcomDate[];
    Place: string[];
}

export interface Between {
    HasYear: boolean;
    HasMonth: boolean;
    HasDay: boolean;
    Value: Date;
}

export interface And {
    HasYear: boolean;
    HasMonth: boolean;
    HasDay: boolean;
    Value: Date;
}

export interface Emigration {
    Date: Date;
    Place?: string;
}

export interface Burial {
    Place?: string;
    Date: Date;
}

export interface Baptism {
    Date: Date;
    Place?: string;
}

export interface Death {
    Place?: string;
    Date: GedcomDate
}

export interface Individual {
    Id: string;
    Fullname: string;
    Sex: string;
    Birth: Birth;
    Relations: string|string[];
    Occupation: string;
    Death: Death;
    Residence: Residence;
    Events: Events;
    Source: Source;
    Notes: Notes;
    Emigration: Emigration;
    Burial: Burial;
    Baptism: Baptism;
    Surname: string;
    Givenname: string;
}

export interface Relation {
    Id: string;
    Marriage: Marriage | 'Y';
    Husband: string;
    Wife: string;
    Children: string | string[];
}

export interface Marriage {
    Place?: string
}

export interface Gedcom {
    Head: Head;
    Individuals: Individual[];
    Relations: Relation[];
}

