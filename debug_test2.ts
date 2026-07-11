import { DevelopmentRules } from './src/aios/DevelopmentRules';
import { CapabilityRegistry } from './src/aios/CapabilityRegistry';

const rule = {
  ruleId: 'rule-1',
  ruleName: 'test',
  capability: 'Testing',
  description: 'Rule testing',
  priority: 10,
  isActive: true,
  createdAt: new Date()
};

CapabilityRegistry.clear();

const keys = Object.getOwnPropertyNames(DevelopmentRules).filter(k => k.startsWith('getExecution'));

for (const k of keys) {
    const val = (DevelopmentRules as any)[k](rule);
    console.log(`${k}: ${!!val}`);
}
