export class TimeoutPolicy {
  public static getValidationTimeout(): number {
    return 5000; // 5 seconds
  }

  public static getRoutingTimeout(): number {
    return 3000; // 3 seconds
  }

  public static getHandlerTimeout(): number {
    return 15000; // 15 seconds
  }

  public static getTotalTimeout(): number {
    return 25000; // 25 seconds limit
  }
}
