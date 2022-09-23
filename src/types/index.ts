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
    Sosa?: number;
    Branch?: string;
    color?:string;
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

export const COLORS_32 = ["#2f1e45", "#861043", "#b41e40", "#c83737", "#da5a3a", "#d4a864", "#c38e65", "#b16c59", "#944c4c", "#7f3748", "#5f253e", "#662c2a", "#8e4f24", "#c6801d", "#e5a732", "#9abf44", "#679c30", "#22783f", "#164a45", "#203b68", "#345f99", "#4293ca", "#64c3de", "#a6c4bf", "#829fa1", "#687f88", "#52636d", "#394451", "#3f2352", "#7d2f7e", "#a83690", "#ce4999"]
