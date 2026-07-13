import { APISchema } from "./APISchema";
import { APIEndpoint } from "./APIEndpoint";
import { APISchemaAnalyzerContext } from "./APISchemaAnalyzerContext";

export interface IAPISchemaAnalyzerEngine {
  analyze(schema: APISchema, context: APISchemaAnalyzerContext): Promise<boolean>;
  parse(rawSchema: string): Promise<APIEndpoint[]>;
  resolve(id: string): Promise<APISchema | null>;
  validate(schema: APISchema): Promise<boolean>;
}

export abstract class BaseAPISchemaAnalyzerEngine implements IAPISchemaAnalyzerEngine {
  abstract analyze(schema: APISchema, context: APISchemaAnalyzerContext): Promise<boolean>;
  abstract parse(rawSchema: string): Promise<APIEndpoint[]>;
  abstract resolve(id: string): Promise<APISchema | null>;
  abstract validate(schema: APISchema): Promise<boolean>;
}
