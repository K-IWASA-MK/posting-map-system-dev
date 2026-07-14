import { PolicyRule } from "./PolicyRule";
import { PolicyContext } from "./PolicyContext";
import { PolicyProfile } from "./PolicyProfile";

export class MockPolicyRule implements PolicyRule {
  constructor(
    public readonly id: string,
    public readonly priority: number,
    public readonly exclusive: boolean,
    public readonly returnedProfile: PolicyProfile | null
  ) {}

  readonly precedence = "NORMAL";
  readonly dependencies = [];

  evaluate(context: PolicyContext): PolicyProfile | null {
    return this.returnedProfile;
  }
}
