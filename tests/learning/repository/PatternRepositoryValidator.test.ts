import { PatternRepositoryValidator } from '../../learning/repository/PatternRepositoryValidator';
import { PatternRepositoryError } from '../../learning/repository/PatternRepositoryError';
import { LearningPattern, PatternStatus } from '../../learning/contracts';

function assertThrows(fn: () => void, expectedMessagePart: string, testName: string) {
  try {
    fn();
    throw new Error(`[FAIL] ${testName} - Expected an error to be thrown.`);
  } catch (err: any) {
    if (err instanceof PatternRepositoryError && err.message.includes(expectedMessagePart)) {
      console.log(`[PASS] ${testName}`);
    } else {
      throw new Error(`[FAIL] ${testName} - Unexpected error: ${err.message}`);
    }
  }
}

function assertPasses(fn: () => void, testName: string) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
  } catch (err: any) {
    throw new Error(`[FAIL] ${testName} - Unexpected error: ${err.message}`);
  }
}

const createMockPattern = (status: PatternStatus, hasEvaluation: boolean, freeze: boolean = true): any => {
  const pattern = {
    schemaVersion: '1.0.0',
    patternId: 'PAT-001',
    version: 1,
    status,
    createdAt: new Date().toISOString(),
    sourceDatasetIds: ['ds-1'],
    patternType: 'SEQUENCE',
    patternData: Object.freeze({ type: 'SEQUENCE' }),
    statistics: Object.freeze({ sampleCount: 10, occurrenceCount: 5 }),
    evaluation: hasEvaluation ? Object.freeze({
      confidence: 0.9,
      qualityScore: 90,
      trustLevel: 'HIGH',
      approvedAt: new Date().toISOString()
    }) : undefined
  };

  return freeze ? Object.freeze(pattern) : pattern;
};

console.log("=== Running PatternRepositoryValidator Tests ===");

assertThrows(
  () => PatternRepositoryValidator.validateForSave(createMockPattern(PatternStatus.DISCOVERED, true)),
  "status APPROVED",
  "Validation fails for DISCOVERED pattern"
);

assertThrows(
  () => PatternRepositoryValidator.validateForSave(createMockPattern(PatternStatus.DEPRECATED, true)),
  "status APPROVED",
  "Validation fails for DEPRECATED pattern"
);

assertThrows(
  () => PatternRepositoryValidator.validateForSave(createMockPattern(PatternStatus.APPROVED, false)),
  "Evaluation data is missing",
  "Validation fails when evaluation is missing"
);

assertThrows(
  () => PatternRepositoryValidator.validateForSave(createMockPattern(PatternStatus.APPROVED, true, false)),
  "immutable",
  "Validation fails when pattern is not frozen"
);

assertPasses(
  () => PatternRepositoryValidator.validateForSave(createMockPattern(PatternStatus.APPROVED, true, true) as any),
  "Validation passes for frozen APPROVED pattern with evaluation"
);

console.log("=== All PatternRepositoryValidator tests passed! ===");
