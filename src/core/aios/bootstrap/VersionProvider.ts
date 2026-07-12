export class VersionProvider {
  public static getVersionInfo() {
    return Object.freeze({
      aiosVersion: '1.0.0',
      sprint: 'Sprint 7',
      build: 'S7-8-Bootstrap',
      specificationVersion: 'v1.0'
    });
  }
}
