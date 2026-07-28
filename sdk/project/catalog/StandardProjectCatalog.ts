/**
 * StandardProjectCatalog.ts
 * 
 * Catalog defining pre-registered Standard Client Projects in AIOS
 */

import { FieldOperationsAdapter } from '../adapter/FieldOperationsAdapter';
import { HokuseiChAdapter } from '../adapter/HokuseiChAdapter';
import { AiSecretaryAdapter } from '../adapter/AiSecretaryAdapter';
import { ProjectProfile } from '../types/ProjectProfile';

export class StandardProjectCatalog {
  public static readonly FIELD_OPERATIONS = new FieldOperationsAdapter();
  public static readonly HOKUSEI_CH = new HokuseiChAdapter();
  public static readonly AI_SECRETARY = new AiSecretaryAdapter();

  public static getAllProfiles(): ProjectProfile[] {
    return [
      this.FIELD_OPERATIONS.getProfile(),
      this.HOKUSEI_CH.getProfile(),
      this.AI_SECRETARY.getProfile()
    ];
  }
}
