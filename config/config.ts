interface SchemaColumn {
  name: string;
  type: string;
  mode?: string;
}
export type Environment = "prod" | "staging";
export interface Table {
  id: string;
  environment: Environment,
  eventType: EventType;
  schema: SchemaColumn[];
}

interface Dataset {
  location: string;
  id: string;
  tables: Table[];
}

export type EventType = "identify" | 'behavior'

const commonSchema: SchemaColumn[] = [
  { name: 'id', type: 'INTEGER', mode: 'REQUIRED'},
  { name: 'eventType', type: 'STRING' },
  { name: 'userId', type: 'STRING' },
  { name: 'timestamp', type: 'TIMESTAMP' },
  { name: 'sessionId', type: 'INTEGER' },
  { name: 'userAgent', type: 'STRING' },
  { name: 'clientId', type: 'STRING' },
  { name: 'uploadTime', type: 'TIMESTAMP' },
];

const behaviorSchema: SchemaColumn[] = [
  ...commonSchema,
  { name: 'product', type: 'STRING'},
  { name: 'caseId', type: 'STRING'},
  { name: 'eventProperties', type: 'STRING'},
];

const identifySchema: SchemaColumn[] = [
  ...commonSchema,
  { name: 'email', type: 'STRING'},
  { name: 'companyId', type: 'STRING'},
  { name: 'companyName', type: 'STRING'},
];

const tables: Table[] = [
  {
    id: 'behavior_events_prod',
    eventType: "behavior",
    environment: "prod",
    schema: behaviorSchema 
  },
  {
    id: 'identify_events_prod',
    eventType: "identify",
    environment: "prod",
    schema: identifySchema,
  },
  {
    id: 'behavior_events_staging',
    eventType: "behavior",
    environment: "staging",
    schema: behaviorSchema 
  },
  {
    id: 'identify_events_staging',
    eventType: "identify",
    environment: "staging",
    schema: identifySchema,
  }
];

export const dataset: Dataset = {
  id: 'lexolve_data',
  location: 'europe-north1',
  tables: tables,
};