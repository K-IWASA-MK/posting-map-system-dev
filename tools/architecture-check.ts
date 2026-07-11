import fs from 'fs';
import path from 'path';

// Define the architecture layers and their allowed dependencies
const allowedDependencies: Record<string, string[]> = {
  'core': [],
  'foundation': ['core'],
  'domain': ['core', 'foundation'],
  'infrastructure': ['core', 'foundation']
};

function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function checkDependencies() {
  const srcDir = path.join(__dirname, '../src');
  const layers = Object.keys(allowedDependencies);
  let hasErrors = false;

  for (const layer of layers) {
    const layerDir = path.join(srcDir, layer);
    const files = getFiles(layerDir);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Look for import statements
      const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Only check alias imports like @domain, @core, etc.
        // We assume paths are properly aliased
        for (const targetLayer of layers) {
          if (importPath.startsWith(`@${targetLayer}`) || importPath.includes(`/src/${targetLayer}/`)) {
            // Check if this layer is allowed to depend on the target layer
            if (layer !== targetLayer && !allowedDependencies[layer].includes(targetLayer)) {
              console.error(`❌ [Architecture Violation] ${file}`);
              console.error(`   Layer '${layer}' is not allowed to import from '${targetLayer}'`);
              console.error(`   Import: '${importPath}'`);
              hasErrors = true;
            }
          }
        }
      }
    }
  }

  // Check Domain Cross-Dependencies (Rule 1)
  const domainDir = path.join(srcDir, 'domain');
  if (fs.existsSync(domainDir)) {
    const domainFeatures = fs.readdirSync(domainDir).filter(f => fs.statSync(path.join(domainDir, f)).isDirectory());
    
    for (const feature of domainFeatures) {
      const featureFiles = getFiles(path.join(domainDir, feature));
      for (const file of featureFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          // Check if it imports another domain feature directly
          for (const otherFeature of domainFeatures) {
            if (feature !== otherFeature && importPath.includes(`@domain/${otherFeature}`)) {
              console.error(`❌ [Domain Cross-Dependency Violation] ${file}`);
              console.error(`   Domain '${feature}' is not allowed to import directly from domain '${otherFeature}'`);
              console.error(`   Import: '${importPath}'`);
              hasErrors = true;
            }
          }
        }
      }
    }
  }

  if (hasErrors) {
    console.error('\n🚨 Architecture check failed. Dependency rules were violated.');
    process.exit(1);
  } else {
    console.log('✅ Architecture check passed. No dependency violations found.');
  }
}

checkDependencies();
