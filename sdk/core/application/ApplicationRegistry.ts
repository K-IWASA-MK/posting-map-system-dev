import { ApplicationDefinition } from './ApplicationModels';

export class ApplicationRegistry {
  private applications = new Map<string, ApplicationDefinition>();

  public registerApplication(app: ApplicationDefinition): void {
    this.applications.set(app.applicationId, app);
  }

  public getApplication(applicationId: string): ApplicationDefinition | undefined {
    return this.applications.get(applicationId);
  }

  public getApplications(): ApplicationDefinition[] {
    return Array.from(this.applications.values());
  }

  public removeApplication(applicationId: string): void {
    this.applications.delete(applicationId);
  }
}
