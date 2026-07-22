import { SalesGeneratorApp } from "./SalesGeneratorApp";

// Standard browser initialization fallback
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = new SalesGeneratorApp();
    app.mount({
      inputContainerId: "input-container",
      progressContainerId: "progress-container",
      previewContainerId: "preview-container"
    });
  });
}

export { SalesGeneratorApp };
