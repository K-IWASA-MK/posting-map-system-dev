export class KnowledgeId {
  private static readonly REGEX = /^KNW-[A-Z0-9]+-\d{6}$/;

  public static generate(type: string, serial: number): string {
    const formattedSerial = String(serial).padStart(6, '0');
    const id = `KNW-${type.toUpperCase()}-${formattedSerial}`;
    this.validate(id);
    return id;
  }

  public static validate(id: string): void {
    if (!this.REGEX.test(id)) {
      throw new Error(`Invalid KnowledgeId format: ${id}. Must be KNW-[TYPE]-[6桁シリアル]`);
    }
  }
}
