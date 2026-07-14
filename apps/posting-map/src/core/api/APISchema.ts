import { APISchemaType } from "./APISchemaType";

export interface APISchema {
  id: string;
  name: string;
  type: APISchemaType;
  version: string;
  rawSchema: string;
}
