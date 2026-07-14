import { promises as fs } from 'fs';
import { PluginManifest } from '../../../models/plugin';

/**
 * ManifestReader
 * 
 * Safely reads and parses manifest.json files from the local file system.
 */
export class ManifestReader {
  
  async read(manifestPath: string): Promise<PluginManifest | null> {
    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const json = JSON.parse(content);
      
      if (this.isValidManifest(json)) {
        return json as PluginManifest;
      }
      return null;
    } catch (e) {
      // Ignore read or parse errors for discovery
      return null;
    }
  }

  private isValidManifest(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Minimal validation to ensure it looks like a manifest.
    // Deep validation is done by the PluginValidator or loader, not by discovery.
    const requiredStrings = ['pluginId', 'name', 'version', 'minimumApiVersion', 'maximumApiVersion', 'kind'];
    
    for (const key of requiredStrings) {
      if (typeof data[key] !== 'string') {
        return false;
      }
    }
    
    if (!Array.isArray(data.capabilities)) {
      return false;
    }
    
    return true;
  }
}
