export class SpreadsheetValidator {
  /**
   * Validates the input CSV data against the expected row count and column headers.
   * Row count validation excludes the header row.
   */
  public validateCsvInput(csvData: string, expectedRowCount: number): void {
    if (!csvData || csvData.trim() === '') {
      throw new Error('[Validation Block] CSV data is empty or invalid.');
    }

    const lines = csvData.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
      throw new Error('[Validation Block] CSV contains no records.');
    }

    // 1. Header Validation
    const headerLine = lines[0];
    const actualHeaders = this.parseCsvRow(headerLine);

    const hasMasterFormat = actualHeaders.includes('full_address');
    if (hasMasterFormat) {
      const required = ['city_name', 'full_address', 'postal_code'];
      for (const req of required) {
        if (!actualHeaders.includes(req)) {
          throw new Error(`[Validation Block] Master CSV format is missing required header: '${req}'. Got: [${actualHeaders.join(', ')}]`);
        }
      }
    } else {
      const required = ['自治体名', '町名/大字', '丁目/詳細'];
      for (const req of required) {
        if (!actualHeaders.includes(req)) {
          throw new Error(`[Validation Block] Legacy CSV format is missing required header: '${req}'. Got: [${actualHeaders.join(', ')}]`);
        }
      }
    }

    // 2. Row Count Validation (excluding header)
    const actualRowCount = lines.length - 1;
    if (actualRowCount !== expectedRowCount) {
      throw new Error(`[Validation Block] Row count mismatch. Expected: ${expectedRowCount}, Actual: ${actualRowCount}`);
    }
  }

  private parseCsvRow(rowText: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
