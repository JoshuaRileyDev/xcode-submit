import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { BuildOptions, Team } from '../types.js';
import { loadConfig } from '../utils/storage.js';
import { findXcodeProject, buildXcodeBuildCommand, buildExportCommand } from '../utils/xcode.js';
import { createTempBuildDirectory, createExportOptionsPlist, cleanupTempDirectory } from '../utils/temp.js';

const execAsync = promisify(exec);

export async function buildAndExport(options: BuildOptions): Promise<void> {
  let { team: teamName, scheme } = options;

  // Load teams configuration
  const config = await loadConfig();
  
  if (config.teams.length === 0) {
    console.error(chalk.red('No teams configured. Please add a team first using "xcode-submit add".'));
    process.exit(1);
  }

  // Interactive prompts if parameters not provided
  if (!teamName || !scheme) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'teamName',
        message: 'Select team:',
        when: !teamName,
        choices: config.teams.map(team => ({
          name: `${team.name} (${team.teamId})`,
          value: team.name
        }))
      },
      {
        type: 'input',
        name: 'scheme',
        message: 'Enter Xcode scheme name:',
        when: !scheme,
        validate: (input: string) => input.trim() !== '' || 'Scheme name is required'
      }
    ]);

    teamName = teamName || answers.teamName;
    scheme = scheme || answers.scheme;
  }

  // Find the team configuration
  const team = config.teams.find(t => t.name === teamName);
  if (!team) {
    console.error(chalk.red(`Team "${teamName}" not found. Available teams: ${config.teams.map(t => t.name).join(', ')}`));
    process.exit(1);
  }

  console.log(chalk.blue(`Building project with team: ${team.name} (${team.teamId})`));

  // Detect Xcode project
  console.log(chalk.gray('Detecting Xcode project...'));
  const project = await findXcodeProject();
  
  if (!project) {
    console.error(chalk.red('No Xcode project or workspace found in current directory.'));
    process.exit(1);
  }

  console.log(chalk.green(`Found ${project.type}: ${project.name}`));

  // Create temporary build directory
  console.log(chalk.gray('Setting up temporary build directory...'));
  const buildPaths = await createTempBuildDirectory(project.name);

  try {
    // Generate exportOptions.plist
    await createExportOptionsPlist(team.teamId, buildPaths.exportOptionsPlistPath);
    console.log(chalk.gray(`Generated export options: ${buildPaths.exportOptionsPlistPath}`));

    // Build archive command
    const archiveCommand = buildXcodeBuildCommand(project, scheme!, buildPaths.archivePath);
    console.log(chalk.blue('Starting archive build...'));
    console.log(chalk.gray(`Command: ${archiveCommand}`));

    // Execute archive build
    await executeCommand(archiveCommand);
    console.log(chalk.green('✓ Archive build completed successfully'));

    // Build export command
    const exportCommand = buildExportCommand(buildPaths.archivePath, buildPaths.exportPath, buildPaths.exportOptionsPlistPath);
    console.log(chalk.blue('Starting export...'));
    console.log(chalk.gray(`Command: ${exportCommand}`));

    // Execute export
    await executeCommand(exportCommand);
    console.log(chalk.green('✓ Export completed successfully'));

    console.log(chalk.green(`\n🎉 Build completed! Output files:`));
    console.log(chalk.cyan(`   Archive: ${buildPaths.archivePath}`));
    console.log(chalk.cyan(`   Export: ${buildPaths.exportPath}`));
    console.log(chalk.yellow(`\nNote: Files will be cleaned up after the next build.`));

  } catch (error) {
    console.error(chalk.red('Build failed:'), error);
    await cleanupTempDirectory(buildPaths.tempDir);
    process.exit(1);
  }
}

async function executeCommand(command: string): Promise<void> {
  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(chalk.gray(stdout));
    }
    
    if (stderr) {
      console.warn(chalk.yellow(stderr));
    }
  } catch (error: any) {
    console.error(chalk.red('Command failed:'), command);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}