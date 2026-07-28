/**
 * EmployeeCapability.ts
 * 
 * Capability Value Object for AI Employees.
 * Supports categories and hierarchical capability identifiers (e.g. VERIFY.CODE, VERIFY.RUNTIME, READ_CODE).
 */

export class EmployeeCapability {
  public readonly id: string;
  public readonly name: string;
  public readonly category: string;
  public readonly description: string;

  constructor(id: string, name: string, category: string = 'GENERAL', description: string = '') {
    if (!id || id.trim() === '') {
      throw new Error('[EmployeeCapability] Capability ID cannot be empty');
    }
    this.id = id.trim().toUpperCase();
    this.name = name || this.id;
    this.category = category.toUpperCase();
    this.description = description;
  }

  public matches(requiredCapabilityId: string): boolean {
    const req = requiredCapabilityId.trim().toUpperCase();
    if (this.id === req) {
      return true;
    }
    // Prefix match support (e.g. VERIFY match for VERIFY.CODE)
    if (req.includes('.') && this.id === req.split('.')[0]) {
      return true;
    }
    if (this.id.includes('.') && req === this.id.split('.')[0]) {
      return true;
    }
    return false;
  }

  public static of(id: string, name?: string, category?: string, description?: string): EmployeeCapability {
    return new EmployeeCapability(id, name || id, category, description);
  }

  // Pre-defined Standard Capabilities
  public static readonly READ_CODE = EmployeeCapability.of('READ_CODE', 'Read Code', 'DEVELOPMENT', 'Ability to read codebases');
  public static readonly WRITE_CODE = EmployeeCapability.of('WRITE_CODE', 'Write Code', 'DEVELOPMENT', 'Ability to write code');
  public static readonly VERIFY = EmployeeCapability.of('VERIFY', 'Verification', 'QUALITY', 'Ability to verify execution');
  public static readonly TEST = EmployeeCapability.of('TEST', 'Test Runner', 'QUALITY', 'Ability to run tests');
  public static readonly DEPLOY = EmployeeCapability.of('DEPLOY', 'Deployment', 'OPERATIONS', 'Ability to deploy applications');
  public static readonly RESEARCH = EmployeeCapability.of('RESEARCH', 'Research', 'ANALYSIS', 'Ability to research requirements');
  public static readonly ANALYZE = EmployeeCapability.of('ANALYZE', 'Analyze', 'ANALYSIS', 'Ability to analyze metrics and state');
  public static readonly REVIEW = EmployeeCapability.of('REVIEW', 'Review', 'QUALITY', 'Ability to review implementations');
  public static readonly GENERATE_DOCS = EmployeeCapability.of('GENERATE_DOCS', 'Generate Documentation', 'DOCUMENTATION', 'Ability to generate documentation');
}
