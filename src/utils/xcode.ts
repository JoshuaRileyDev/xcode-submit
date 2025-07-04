import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export interface XcodeProject {
  type: 'workspace' | 'project';
  path: string;
  name: string;
}

export async function findXcodeProject(searchDir: string = process.cwd()): Promise<XcodeProject | null> {
  try {
    // First look for workspace files (preferred over project files)
    const workspaceFiles = await glob('**/*.xcworkspace', {
      cwd: searchDir,
      maxDepth: 3,
      ignore: ['**/Pods/**', '**/node_modules/**', '**/build/**']
    });

    if (workspaceFiles.length > 0) {
      const workspacePath = path.join(searchDir, workspaceFiles[0]);
      return {
        type: 'workspace',
        path: workspacePath,
        name: path.basename(workspacePath, '.xcworkspace')
      };
    }

    // If no workspace found, look for project files
    const projectFiles = await glob('**/*.xcodeproj', {
      cwd: searchDir,
      maxDepth: 3,
      ignore: ['**/Pods/**', '**/node_modules/**', '**/build/**']
    });

    if (projectFiles.length > 0) {
      const projectPath = path.join(searchDir, projectFiles[0]);
      return {
        type: 'project',
        path: projectPath,
        name: path.basename(projectPath, '.xcodeproj')
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching for Xcode project:', error);
    return null;
  }
}

export function buildXcodeBuildCommand(
  project: XcodeProject,
  scheme: string,
  archivePath: string
): string {
  const projectFlag = project.type === 'workspace' ? '-workspace' : '-project';
  return `xcodebuild clean archive -scheme "${scheme}" ${projectFlag} "${project.path}" -configuration Release -archivePath "${archivePath}"`;
}

export function buildExportCommand(
  archivePath: string,
  exportPath: string,
  exportOptionsPlistPath: string
): string {
  return `xcodebuild -exportArchive -archivePath "${archivePath}" -exportPath "${exportPath}" -exportOptionsPlist "${exportOptionsPlistPath}"`;
}