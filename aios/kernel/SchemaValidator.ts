import * as fs from 'fs';
import { ProtocolRegistry } from './ProtocolRegistry';
import { ValidationResult, ValidationError } from './ValidationResult';

export class SchemaValidator {
  /**
   * Validates a message payload against a registered protocol schema.
   */
  public static validate(protocolId: string, payload: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    // 1. Resolve Schema path from registry
    const metadata = ProtocolRegistry.get(protocolId);
    if (!metadata) {
      return {
        valid: false,
        protocolId,
        protocolVersion: "0.0.0",
        errors: [{
          code: "UNKNOWN_PROTOCOL",
          field: "protocolId",
          message: `Protocol "${protocolId}" is not registered in AIOS ProtocolRegistry.`
        }]
      };
    }

    if (!payload || typeof payload !== 'object') {
      return {
        valid: false,
        protocolId: metadata.protocolId,
        protocolVersion: metadata.version,
        errors: [{
          code: "INVALID_PAYLOAD",
          field: "",
          message: "Payload must be a non-null JSON object."
        }]
      };
    }

    const data = payload as any;

    // 2. Schema existence verification on disk (Contract-01)
    let schema: any;
    try {
      if (!fs.existsSync(metadata.schemaPath)) {
        return {
          valid: false,
          protocolId: metadata.protocolId,
          protocolVersion: metadata.version,
          errors: [{
            code: "SCHEMA_NOT_FOUND",
            field: "",
            message: `JSON Schema file not found on disk at: ${metadata.schemaPath}`
          }]
        };
      }
      const fileContent = fs.readFileSync(metadata.schemaPath, 'utf8');
      schema = JSON.parse(fileContent);
    } catch (err: any) {
      return {
        valid: false,
        protocolId: metadata.protocolId,
        protocolVersion: metadata.version,
        errors: [{
          code: "SCHEMA_PARSE_ERROR",
          field: "",
          message: `Failed to load or parse JSON Schema: ${err.message}`
        }]
      };
    }

    // 3. Verify protocol metadata properties
    if (data.protocolId === undefined) {
      errors.push({
        code: "MISSING_REQUIRED",
        field: "protocolId",
        message: "Required field 'protocolId' is missing."
      });
    } else if (data.protocolId !== metadata.protocolId) {
      errors.push({
        code: "VALUE_MISMATCH",
        field: "protocolId",
        message: `protocolId mismatch. Expected: "${metadata.protocolId}", got: "${data.protocolId}"`
      });
    }

    const payloadVersion = data.protocolVersion;
    if (payloadVersion === undefined) {
      errors.push({
        code: "MISSING_REQUIRED",
        field: "protocolVersion",
        message: "Required field 'protocolVersion' is missing."
      });
    } else {
      // Contract-02: Semantic compatibility checks
      let isCompatible = false;
      for (const compRange of metadata.compatibleVersions) {
        if (this.semverCompatible(payloadVersion, compRange)) {
          isCompatible = true;
          break;
        }
      }
      if (!isCompatible) {
        errors.push({
          code: "VERSION_INCOMPATIBLE",
          field: "protocolVersion",
          message: `protocolVersion "${payloadVersion}" is incompatible with registered compatibility ranges: ${JSON.stringify(metadata.compatibleVersions)}`
        });
      }
    }

    // 4. Perform recursive JSON Schema subset validation (Contract-03, Contract-04)
    this.validateSubset(data, schema, "", errors);

    return {
      valid: errors.length === 0,
      protocolId: metadata.protocolId,
      protocolVersion: payloadVersion || "0.0.0",
      errors
    };
  }

  /**
   * Lightweight SemVer caret comparison helper.
   * Supports basic matching: "1.2.3" matches "^1.2.0"
   */
  private static semverCompatible(version: string, range: string): boolean {
    if (!range.startsWith('^')) {
      return version === range;
    }
    const cleanRange = range.slice(1);
    const vParts = version.split('.').map(Number);
    const rParts = cleanRange.split('.').map(Number);

    if (vParts.length < 3 || rParts.length < 3 || vParts.some(isNaN) || rParts.some(isNaN)) {
      return false;
    }

    // Major version must match exactly (carets do not cross major boundaries)
    if (vParts[0] !== rParts[0]) {
      return false;
    }

    // Minor version must be greater or equal
    if (vParts[1] > rParts[1]) {
      return true;
    }
    if (vParts[1] < rParts[1]) {
      return false;
    }

    // Patch version must be greater or equal
    return vParts[2] >= rParts[2];
  }

  /**
   * Recurses through properties and items validating types, enum, const, pattern and required constraints.
   */
  private static validateSubset(data: any, schema: any, path: string, errors: ValidationError[]): void {
    if (!schema || typeof schema !== 'object') {
      return;
    }

    // Check required fields (Contract-03)
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        const value = data ? data[reqKey] : undefined;
        if (value === undefined || value === null) {
          const fieldPath = path ? `${path}.${reqKey}` : reqKey;
          errors.push({
            code: "MISSING_REQUIRED",
            field: fieldPath,
            message: `Required property '${fieldPath}' is missing or null.`
          });
        }
      }
    }

    // Check property rules (Contract-04)
    if (schema.properties && data && typeof data === 'object') {
      for (const propKey of Object.keys(schema.properties)) {
        const propSchema = schema.properties[propKey];
        const value = data[propKey];
        if (value === undefined || value === null) {
          continue; // Missing optional values are handled by the required check above
        }

        const fieldPath = path ? `${path}.${propKey}` : propKey;

        // Type Checks
        if (propSchema.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (propSchema.type === 'array') {
            if (!Array.isArray(value)) {
              errors.push({
                code: "INVALID_TYPE",
                field: fieldPath,
                message: `Property '${fieldPath}' is not an array. Expected: 'array', got: '${actualType}'`
              });
              continue;
            }
            // Validate array items recursively
            if (propSchema.items) {
              for (let i = 0; i < value.length; i++) {
                const itemPath = `${fieldPath}.${i}`;
                if (propSchema.items.type === 'object') {
                  if (typeof value[i] !== 'object' || value[i] === null || Array.isArray(value[i])) {
                    errors.push({
                      code: "INVALID_TYPE",
                      field: itemPath,
                      message: `Array item '${itemPath}' is not an object.`
                    });
                  } else {
                    this.validateSubset(value[i], propSchema.items, itemPath, errors);
                  }
                } else if (propSchema.items.type) {
                  if (typeof value[i] !== propSchema.items.type) {
                    errors.push({
                      code: "INVALID_TYPE",
                      field: itemPath,
                      message: `Array item '${itemPath}' type mismatch. Expected: '${propSchema.items.type}', got: '${typeof value[i]}'`
                    });
                  }
                }
              }
            }
          } else if (propSchema.type === 'object') {
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push({
                code: "INVALID_TYPE",
                field: fieldPath,
                message: `Property '${fieldPath}' is not an object. Expected: 'object', got: '${actualType}'`
              });
              continue;
            }
            this.validateSubset(value, propSchema, fieldPath, errors);
          } else if (propSchema.type === 'number') {
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({
                code: "INVALID_TYPE",
                field: fieldPath,
                message: `Property '${fieldPath}' is not a number. Expected: 'number', got: '${actualType}'`
              });
              continue;
            }
          } else if (typeof value !== propSchema.type) {
            errors.push({
              code: "INVALID_TYPE",
              field: fieldPath,
              message: `Property '${fieldPath}' type mismatch. Expected: '${propSchema.type}', got: '${actualType}'`
              });
            continue;
          }
        }

        // Const check
        if (propSchema.const !== undefined && value !== propSchema.const) {
          errors.push({
            code: "VALUE_MISMATCH",
            field: fieldPath,
            message: `Property '${fieldPath}' const mismatch. Expected constant: ${JSON.stringify(propSchema.const)}, got: ${JSON.stringify(value)}`
          });
        }

        // Enum check
        if (Array.isArray(propSchema.enum) && !propSchema.enum.includes(value)) {
          errors.push({
            code: "INVALID_ENUM",
            field: fieldPath,
            message: `Property '${fieldPath}' value ${JSON.stringify(value)} is not allowed. Must be one of: ${JSON.stringify(propSchema.enum)}`
          });
        }

        // Pattern Regex check
        if (propSchema.type === 'string' && typeof value === 'string' && propSchema.pattern) {
          try {
            const regex = new RegExp(propSchema.pattern);
            if (!regex.test(value)) {
              errors.push({
                code: "PATTERN_MISMATCH",
                field: fieldPath,
                message: `Property '${fieldPath}' does not match pattern regex: ${propSchema.pattern}`
              });
            }
          } catch (err: any) {
            errors.push({
              code: "PATTERN_ERROR",
              field: fieldPath,
              message: `Invalid regex pattern defined in schema for '${fieldPath}': ${err.message}`
            });
          }
        }
      }
    }
  }
}
