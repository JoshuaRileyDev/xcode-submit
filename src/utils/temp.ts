import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const CONFIG_DIR = path.join(os.homedir(), '.xcode-submit');
const TEMP_DIR = path.join(CONFIG_DIR, 'tmp');

export interface BuildPaths {
  tempDir: string;
  archivePath: string;
  exportPath: string;
  exportOptionsPlistPath: string;
}

export async function createTempBuildDirectory(projectName: string): Promise<BuildPaths> {
  // Create a unique temp directory for this build
  const buildId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join(TEMP_DIR, `build-${projectName}-${buildId}`);
  
  await fs.ensureDir(tempDir);
  
  const archivePath = path.join(tempDir, `${projectName}.xcarchive`);
  const exportPath = path.join(tempDir, 'export');
  const exportOptionsPlistPath = path.join(tempDir, 'exportOptions.plist');
  
  // Ensure export directory exists
  await fs.ensureDir(exportPath);
  
  return {
    tempDir,
    archivePath,
    exportPath,
    exportOptionsPlistPath
  };
}

export async function cleanupTempDirectory(tempDir: string): Promise<void> {
  try {
    await fs.remove(tempDir);
    console.log(`Cleaned up temporary directory: ${tempDir}`);
  } catch (error) {
    console.warn(`Warning: Failed to cleanup temporary directory ${tempDir}:`, error);
  }
}

export async function createExportOptionsPlist(
  teamId: string,
  plistPath: string
): Promise<void> {
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>${teamId}</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>`;

  await fs.writeFile(plistPath, plistContent, 'utf8');
}