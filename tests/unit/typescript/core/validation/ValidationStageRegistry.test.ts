import { ValidationStageRegistry } from '../../../../../sdk/core/validation/ValidationStageRegistry';
import { RegexValidationStage } from '../../../../../sdk/core/validation/stages/RegexValidationStage';
import { AstValidationStage } from '../../../../../sdk/core/validation/stages/AstValidationStage';
import { ValidationStageType } from '../../../../../sdk/core/validation/ValidationStageType';
import { DevelopmentContextBuilder } from '../../../../../sdk/core/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running ValidationStageRegistry tests...');
  
  const registry = new ValidationStageRegistry();
  const regexStage = new RegexValidationStage();
  const astStage = new AstValidationStage();

  registry.register(regexStage);
  registry.register(astStage);
  
  assert(registry.findAll().length === 2, 'Should have 2 registered stages');

  const found = registry.findByType(ValidationStageType.REGEX);
  assert(found !== undefined && found.metadata.type === ValidationStageType.REGEX, 'Should find REGEX stage');

  let threwError = false;
  try {
    registry.register(regexStage);
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw error when registering duplicate stage type');

  const context = new DevelopmentContextBuilder()
    .setContextType(DevelopmentContextType.RepositoryReview)
    .setProject('test')
    .build();

  const supported = registry.findSupported(context);
  assert(supported.length === 2, 'Should find 2 supported stages');

  registry.clear();
  assert(registry.findAll().length === 0, 'Registry should be empty after clear');

  console.log('All ValidationStageRegistry tests passed!');
}

runTests();
