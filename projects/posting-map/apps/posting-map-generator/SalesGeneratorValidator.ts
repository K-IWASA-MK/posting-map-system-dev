import { SalesGeneratorViewModel } from "./SalesGeneratorViewModel";

export class SalesGeneratorValidator {
  /**
   * Validates if the input districtName is acceptable.
   */
  public validateDistrictName(districtName: string): { success: boolean; error?: string } {
    if (!districtName || districtName.trim() === "") {
      return { success: false, error: "選挙区名を入力してください。" };
    }
    return { success: true };
  }

  /**
   * Validates if the preview can be launched.
   */
  public canPreview(viewModel: SalesGeneratorViewModel): boolean {
    return viewModel.status === "completed" && viewModel.previewReady;
  }
}
