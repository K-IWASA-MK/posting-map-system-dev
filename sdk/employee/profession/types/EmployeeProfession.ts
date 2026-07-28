/**
 * EmployeeProfession.ts
 * 
 * Employee Profession Model
 */

import { ProfessionId } from './ProfessionId';
import { ProfessionCategory } from './ProfessionCategory';

export interface EmployeeProfession {
  professionId: ProfessionId;
  title: string;
  category: ProfessionCategory;
  description: string;
  isCustomProjectProfession?: boolean;
}
