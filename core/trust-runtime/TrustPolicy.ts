/**
 * TrustPolicy holds static scoring threshold and penalty weights for G6.
 */
export const TrustPolicy = {
  MINIMUM_TRUSTED_SCORE: 80,
  MINIMUM_SANDBOX_SCORE: 50,

  PENALTY_PERMISSION_DENIED: 20,
  PENALTY_WORKSPACE_LOCKED: 15,
  PENALTY_INVALID_SIGNATURE: 30
};
