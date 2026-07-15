export interface ValidationPlan {
  validationPlanId: string;
  planVersion: string;
  
  // Graph details
  graphVersion: string;
  validatorGraph: any; // DAG representation
  dependencyGraph: any;
  executionOrder: string[];
  parallelGroup: string[][];
  
  validatorCount: number;
  estimatedDuration: number;
  
  // Requirements & Traceability
  requiredCapabilities: string[];
  approvalTraceId: string;
  executionTraceId: string;
  
  // Configs
  threshold: number;
  expectedScore: number;
  policy: any;
  timeout: number;
  retryPolicy: any;
}
