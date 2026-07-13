import { DevelopmentContextBuilder } from '../../../../../../sdk/core/aios/context/DevelopmentContextBuilder';
import { DevelopmentContextType } from '../../../../../../sdk/core/aios/context/DevelopmentContextType';
import { DevelopmentContextStatus } from '../../../../../../sdk/core/aios/context/DevelopmentContextStatus';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running DevelopmentContextBuilder tests...');

  // Test 1: Missing required fields
  let builder = new DevelopmentContextBuilder();
  try {
    builder.build();
    assert(false, 'Should throw error when contextType is missing');
  } catch (e: any) {
    assert(e.message.includes('contextType is required'), 'Expected contextType required error');
  }

  builder.setContextType(DevelopmentContextType.RepositoryReview);
  try {
    builder.build();
    assert(false, 'Should throw error when project is missing');
  } catch (e: any) {
    assert(e.message.includes('project is required'), 'Expected project required error');
  }

  // Test 2: Successful build and default values
  builder.setProject('posting-map');
  const context = builder.build();
  
  assert(context.contextId !== undefined && context.contextId.length > 0, 'contextId should be generated');
  assert(context.contextVersion === '1.0.0', 'contextVersion should default to 1.0.0');
  assert(context.status === DevelopmentContextStatus.CREATED, 'status should default to CREATED');
  assert(context.createdAt !== undefined, 'createdAt should be generated');

  // Test 3: Immutability checks
  assert(Object.isFrozen(context), 'context should be frozen');
  assert(Object.isFrozen(context.metadata), 'context.metadata should be frozen');
  assert(Object.isFrozen(context.changedFiles), 'context.changedFiles should be frozen');

  // Try to mutate directly (in strict mode, this throws TypeError)
  let threwError = false;
  try {
    'use strict';
    // @ts-ignore: Intentionally violating readonly to test runtime immutability
    context.project = 'hacked';
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw TypeError when trying to mutate a frozen object');

  // Try to mutate nested object
  threwError = false;
  try {
    'use strict';
    // @ts-ignore
    context.metadata['newKey'] = 'value';
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw TypeError when trying to mutate frozen metadata');

  console.log('All DevelopmentContextBuilder tests passed!');
}

runTests();
