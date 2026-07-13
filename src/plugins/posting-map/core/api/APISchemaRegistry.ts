import { APISchema } from "./APISchema";

export class APISchemaRegistry {
  private registry: Map<string, APISchema> = new Map();

  public async addSchema(schema: APISchema): Promise<boolean> {
    if (this.registry.has(schema.id)) {
      return false;
    }
    this.registry.set(schema.id, schema);
    return true;
  }

  public async findSchema(id: string): Promise<APISchema | null> {
    return this.registry.get(id) || null;
  }

  public async listSchemas(): Promise<APISchema[]> {
    return Array.from(this.registry.values());
  }

  public async removeSchema(id: string): Promise<boolean> {
    return this.registry.delete(id);
  }
}
