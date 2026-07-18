import { NationalTurnoutContract } from "../contracts/TurnoutContract";

export class NationalTurnout implements NationalTurnoutContract {
  public readonly level: "NATIONAL" = "NATIONAL";
  public readonly turnout: number;

  constructor(turnout: number) {
    this.turnout = turnout;
  }
}
