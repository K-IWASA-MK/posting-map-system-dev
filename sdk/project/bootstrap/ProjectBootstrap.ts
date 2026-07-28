/**
 * ProjectBootstrap.ts
 * 
 * Bootstrap initializer registering Standard Project Catalog into ProjectRegistry
 */

import { ProjectRegistry } from '../registry/ProjectRegistry';
import { StandardProjectCatalog } from '../catalog/StandardProjectCatalog';
import { ProjectEventPublisher } from '../event/ProjectEventPublisher';
import { ProjectEventType } from '../event/types/ProjectEventType';

export class ProjectBootstrap {
  private static isInitialized = false;

  public static bootstrap(): void {
    if (this.isInitialized) return;

    const profiles = StandardProjectCatalog.getAllProfiles();
    profiles.forEach((profile) => {
      ProjectRegistry.register(profile);
      ProjectEventPublisher.publish(
        ProjectEventType.PROJECT_REGISTERED,
        profile.projectId.getValue(),
        undefined,
        { projectName: profile.projectName, projectType: profile.projectType }
      );
    });

    this.isInitialized = true;
  }

  public static clear(): void {
    ProjectRegistry.clear();
    this.isInitialized = false;
  }
}
