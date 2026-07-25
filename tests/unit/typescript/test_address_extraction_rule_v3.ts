import { AddressHierarchyExtractor } from '../../../src/platform/data-platform/extractor/AddressHierarchyExtractor';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[AssertionFailed] ${message}`);
  }
}

function runAddressExtractionRuleV3Tests() {
  console.log('[Test AddressExtractionRuleV3] Starting Rule v3 dynamic completeness algorithm tests...');

  const extractor = new AddressHierarchyExtractor();

  // Test 1: Level 1 contains 丁目 -> Complete at level 1 (東員町 1丁目)
  console.log('[Test AddressExtractionRuleV3] 1. Level 1 with 丁目 check (東員町 1丁目)...');
  const node1 = extractor.extractHierarchyNode('東員町', '1丁目');
  assert(node1.fullAddress === '東員町1丁目', 'Full address matches 東員町1丁目');
  assert(node1.extractionRule === 'RULE_V3_LEVEL1_COMPLETE', 'Rule is RULE_V3_LEVEL1_COMPLETE');

  // Test 2: Level 1 coarse, Level 2 contains 丁目 -> Complete at level 2 (桑名市 江場 1丁目)
  console.log('[Test AddressExtractionRuleV3] 2. Level 1 coarse + Level 2 丁目 check (桑名市 江場 1丁目)...');
  const node2 = extractor.extractHierarchyNode('桑名市', '江場', '1丁目');
  assert(node2.fullAddress === '桑名市江場1丁目', 'Full address matches 桑名市江場1丁目');
  assert(node2.extractionRule === 'RULE_V3_LEVEL2_COMPLETE', 'Rule is RULE_V3_LEVEL2_COMPLETE');

  // Test 3: Level 1 coarse, Level 2 sub-town -> Complete at level 2 (桑名市 長島町 千倉)
  console.log('[Test AddressExtractionRuleV3] 3. Level 1 coarse + Level 2 sub-town check (桑名市 長島町 千倉)...');
  const node3 = extractor.extractHierarchyNode('桑名市', '長島町', '千倉');
  assert(node3.fullAddress === '桑名市長島町千倉', 'Full address matches 桑名市長島町千倉');
  assert(node3.extractionRule === 'RULE_V3_LEVEL2_COMPLETE', 'Rule is RULE_V3_LEVEL2_COMPLETE');

  console.log('\n=================================================');
  console.log('  ADDRESS EXTRACTION RULE V3 PASSED');
  console.log('=================================================\n');
}

runAddressExtractionRuleV3Tests();
