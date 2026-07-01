import { APISchema } from "./APISchema";
import { APIEndpoint } from "./APIEndpoint";

export class APISchemaMapper {
  public async mapEndpoints(schema: APISchema): Promise<APIEndpoint[]> {
    return [];
  }

  public async mapTypes(schema: APISchema): Promise<Record<string, any>> {
    return {};
  }

  public async buildGraph(endpoints: APIEndpoint[]): Promise<Record<string, any>> {
    return {};
  }
}
