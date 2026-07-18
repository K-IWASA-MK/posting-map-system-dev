/**
 * POSTING MAP - Order-to-Branch Automation Runtime
 * OrderRequest Data Interface
 */
export interface OrderRequest {
  orderId: string;
  districtName: string;
  customerType: string; // must be 'branch'
  requestedAt: string;  // YYYY-MM-DD
}
