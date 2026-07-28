/**
 * OrganizationBootstrap.ts
 * 
 * Bootstraps AI Company Organization, Departments, and Provisions Employees from OrganizationBlueprint
 */

import { OrganizationId } from '../types/OrganizationId';
import { DepartmentId } from '../types/DepartmentId';
import { EmployeeOrganization } from '../types/EmployeeOrganization';
import { OrganizationBlueprint } from '../types/OrganizationBlueprint';
import { OrganizationRegistry } from '../registry/OrganizationRegistry';
import { DepartmentRegistry } from '../registry/DepartmentRegistry';
import { AIEmployeeRegistry } from '../../manager/registry/AIEmployeeRegistry';
import { EmployeeRole } from '../../role/types/EmployeeRole';
import { EmployeeCapability } from '../../capability/types/EmployeeCapability';
import { EmployeeProvisioningService } from '../../provisioning/EmployeeProvisioningService';
import { StandardProfessionCatalog } from '../../profession/catalog/StandardProfessionCatalog';
import { ProfessionTemplateFactory } from '../../profession/assignment/types/ProfessionTemplate';

export class OrganizationBootstrap {
  private static defaultBlueprint: OrganizationBlueprint = {
    blueprintId: 'blueprint-aios-default',
    companyName: 'AIOS Enterprise AI Company',
    supervisorSpec: {
      employeeId: 'emp-supervisor-01',
      employeeName: 'Chief AI Supervisor Agent',
      departmentId: DepartmentId.EXECUTIVE,
      capabilities: ['READ_CODE', 'ANALYZE', 'REVIEW', 'VERIFY']
    },
    workerSpecs: [
      {
        role: EmployeeRole.SENIOR_WORKER,
        employeeName: 'Research Worker Agent',
        departmentId: DepartmentId.RESEARCH,
        capabilities: ['RESEARCH', 'READ_CODE', 'ANALYZE'],
        count: 1
      },
      {
        role: EmployeeRole.WORKER,
        employeeName: 'Discovery Worker Agent',
        departmentId: DepartmentId.RESEARCH,
        capabilities: ['RESEARCH', 'ANALYZE'],
        count: 1
      },
      {
        role: EmployeeRole.SENIOR_WORKER,
        employeeName: 'Validator Agent',
        departmentId: DepartmentId.VALIDATION,
        capabilities: ['VERIFY', 'TEST', 'REVIEW'],
        count: 1
      },
      {
        role: EmployeeRole.WORKER,
        employeeName: 'Reviewer Agent',
        departmentId: DepartmentId.VALIDATION,
        capabilities: ['REVIEW', 'READ_CODE'],
        count: 1
      },
      {
        role: EmployeeRole.SENIOR_WORKER,
        employeeName: 'Implementation Worker Agent',
        departmentId: DepartmentId.DEVELOPMENT,
        capabilities: ['WRITE_CODE', 'READ_CODE', 'TEST'],
        count: 1
      },
      {
        role: EmployeeRole.WORKER,
        employeeName: 'Refactoring Worker Agent',
        departmentId: DepartmentId.DEVELOPMENT,
        capabilities: ['WRITE_CODE', 'READ_CODE'],
        count: 1
      },
      {
        role: EmployeeRole.SENIOR_WORKER,
        employeeName: 'Deployment Worker Agent',
        departmentId: DepartmentId.DEPLOYMENT,
        capabilities: ['DEPLOY', 'VERIFY'],
        count: 1
      }
    ]
  };

  /**
   * Bootstraps the full Organization and provisions all workers into AIEmployeeRegistry
   */
  public static bootstrap(
    registry?: AIEmployeeRegistry,
    blueprint: OrganizationBlueprint = OrganizationBootstrap.defaultBlueprint
  ): EmployeeOrganization {
    const activeRegistry = registry || new AIEmployeeRegistry();

    // 1. Create and register Departments
    const departments = [
      { departmentId: DepartmentId.EXECUTIVE, departmentName: 'Executive Office', supervisorId: blueprint.supervisorSpec.employeeId },
      { departmentId: DepartmentId.RESEARCH, departmentName: 'Research Division', parentDepartmentId: DepartmentId.EXECUTIVE },
      { departmentId: DepartmentId.VALIDATION, departmentName: 'Validation Division', parentDepartmentId: DepartmentId.EXECUTIVE },
      { departmentId: DepartmentId.DEVELOPMENT, departmentName: 'Development Division', parentDepartmentId: DepartmentId.EXECUTIVE },
      { departmentId: DepartmentId.DEPLOYMENT, departmentName: 'Deployment Division', parentDepartmentId: DepartmentId.EXECUTIVE }
    ];

    departments.forEach((dept) => DepartmentRegistry.register(dept));

    // 2. Create and register Organization
    const organization: EmployeeOrganization = {
      organizationId: OrganizationId.of('company-aios-core'),
      companyName: blueprint.companyName,
      departments,
      createdAt: new Date().toISOString()
    };
    OrganizationRegistry.register(organization);

    // 3. Provision Supervisor
    const supCaps = blueprint.supervisorSpec.capabilities.map((c) => EmployeeCapability.of(c));
    const supAssignment = ProfessionTemplateFactory.createAssignmentFromTemplate(
      StandardProfessionCatalog.TEMPLATES.ARCH_ENG,
      blueprint.supervisorSpec.employeeId
    );
    EmployeeProvisioningService.provisionEmployee(
      activeRegistry,
      blueprint.supervisorSpec.employeeId,
      blueprint.supervisorSpec.employeeName,
      EmployeeRole.SUPERVISOR,
      blueprint.supervisorSpec.departmentId,
      supCaps,
      undefined,
      supAssignment
    );

    // 4. Provision Workers dynamically from Blueprint specs
    let workerCounter = 1;
    for (const spec of blueprint.workerSpecs) {
      const count = spec.count || 1;
      for (let i = 0; i < count; i++) {
        const empId = `emp-${spec.departmentId.replace('dept-', '')}-${String(workerCounter).padStart(2, '0')}`;
        const caps = spec.capabilities.map((c) => EmployeeCapability.of(c));

        let tpl = StandardProfessionCatalog.TEMPLATES.IMPL_ENG;
        if (spec.departmentId === DepartmentId.VALIDATION) {
          tpl = StandardProfessionCatalog.TEMPLATES.VAL_SPEC;
        } else if (spec.departmentId === DepartmentId.DEPLOYMENT) {
          tpl = StandardProfessionCatalog.TEMPLATES.DEPLOY_ENG;
        } else if (spec.departmentId === DepartmentId.RESEARCH) {
          tpl = StandardProfessionCatalog.TEMPLATES.ARCH_ENG;
        }

        const workerProfAssignment = ProfessionTemplateFactory.createAssignmentFromTemplate(tpl, empId);

        EmployeeProvisioningService.provisionEmployee(
          activeRegistry,
          empId,
          `${spec.employeeName} ${i + 1}`,
          spec.role,
          spec.departmentId,
          caps,
          undefined,
          workerProfAssignment
        );
        workerCounter++;
      }
    }

    return organization;
  }
}
