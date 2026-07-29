/**
 * Spreadsheet Schema definition.
 * Holds column index mapping to decouple column numbers from RowMapper.
 */
export const TaskSheetSchema = {
  COLUMNS: {
    TASK_ID: 0,
    STATUS: 1,
    COMPLETED_AT: 2,
    EXECUTION_ID: 3,
    IDEMPOTENCY_KEY: 4,
    LAST_UPDATED: 5,
    VERSION: 6 // Used for Optimistic Concurrency
  }
};

export const DistributionSheetSchema = {
  // Placeholder for future schema
};
