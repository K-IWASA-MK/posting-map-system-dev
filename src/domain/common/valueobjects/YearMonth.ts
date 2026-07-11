export class YearMonth {
  private readonly year: number;
  private readonly month: number;

  constructor(value: string | Date) {
    if (value instanceof Date) {
      this.year = value.getFullYear();
      this.month = value.getMonth() + 1;
    } else {
      const clean = value.replace(/[-\s\/]/g, '');
      if (clean.length !== 6 || isNaN(Number(clean))) {
        throw new Error(`Invalid YearMonth format: ${value}`);
      }
      this.year = parseInt(clean.substring(0, 4), 10);
      this.month = parseInt(clean.substring(4, 6), 10);
    }

    if (this.month < 1 || this.month > 12) {
      throw new Error(`Invalid month value: ${this.month}`);
    }
  }

  public getYear(): number {
    return this.year;
  }

  public getMonth(): number {
    return this.month;
  }

  public toString(): string {
    const mm = String(this.month).padStart(2, '0');
    return `${this.year}${mm}`;
  }

  public getStartDate(): Date {
    return new Date(this.year, this.month - 1, 1, 0, 0, 0, 0);
  }

  public getEndDate(): Date {
    return new Date(this.year, this.month, 0, 23, 59, 59, 999);
  }

  public equals(other: YearMonth): boolean {
    return this.year === other.getYear() && this.month === other.getMonth();
  }
}
