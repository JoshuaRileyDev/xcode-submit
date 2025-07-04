import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { Team, AddTeamOptions } from '../types.js';
import { initializeStorage as initStorage, loadConfig, saveConfig, validateKeyPath } from '../utils/storage.js';

export async function initializeStorage(): Promise<void> {
  await initStorage();
}

export async function addTeam(options: AddTeamOptions): Promise<void> {
  let { name, issuerId, teamId, keyId, keyPath, nonInteractive } = options;

  if (!nonInteractive) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Team reference name:',
        when: !name,
        validate: (input: string) => input.trim() !== '' || 'Team name is required'
      },
      {
        type: 'input',
        name: 'issuerId',
        message: 'Issuer ID:',
        when: !issuerId,
        validate: (input: string) => input.trim() !== '' || 'Issuer ID is required'
      },
      {
        type: 'input',
        name: 'teamId',
        message: 'Team ID:',
        when: !teamId,
        validate: (input: string) => input.trim() !== '' || 'Team ID is required'
      },
      {
        type: 'input',
        name: 'keyId',
        message: 'Key ID:',
        when: !keyId,
        validate: (input: string) => input.trim() !== '' || 'Key ID is required'
      },
      {
        type: 'input',
        name: 'keyPath',
        message: 'Path to .p8 key file:',
        when: !keyPath,
        validate: async (input: string) => {
          if (!input.trim()) return 'Key path is required';
          
          // Handle tilde expansion and resolve path
          let expandedPath = input.trim();
          
          // Remove surrounding quotes if present
          if ((expandedPath.startsWith('"') && expandedPath.endsWith('"')) ||
              (expandedPath.startsWith("'") && expandedPath.endsWith("'"))) {
            expandedPath = expandedPath.slice(1, -1);
          }
          
          if (expandedPath.startsWith('~')) {
            expandedPath = expandedPath.replace(/^~/, process.env.HOME || '');
          }
          expandedPath = path.resolve(expandedPath);
          
          const isValid = await validateKeyPath(expandedPath);
          
          return isValid || `Invalid .p8 file path: ${expandedPath}`;
        }
      }
    ]);

    name = name || answers.name;
    issuerId = issuerId || answers.issuerId;
    teamId = teamId || answers.teamId;
    keyId = keyId || answers.keyId;
    keyPath = keyPath || answers.keyPath;
  }

  if (!name || !issuerId || !teamId || !keyId || !keyPath) {
    console.error(chalk.red('Error: All fields are required (name, issuer-id, team-id, key-id, key-path)'));
    process.exit(1);
  }

  // Clean up the keyPath - remove quotes and handle tilde expansion
  let cleanKeyPath = keyPath.trim();
  
  // Remove surrounding quotes if present
  if ((cleanKeyPath.startsWith('"') && cleanKeyPath.endsWith('"')) ||
      (cleanKeyPath.startsWith("'") && cleanKeyPath.endsWith("'"))) {
    cleanKeyPath = cleanKeyPath.slice(1, -1);
  }
  
  if (cleanKeyPath.startsWith('~')) {
    cleanKeyPath = cleanKeyPath.replace(/^~/, process.env.HOME || '');
  }
  
  const expandedKeyPath = path.resolve(cleanKeyPath);
  
  if (!(await validateKeyPath(expandedKeyPath))) {
    console.error(chalk.red('Error: Invalid .p8 file path'));
    process.exit(1);
  }

  const config = await loadConfig();
  
  if (config.teams.find(team => team.name === name)) {
    console.error(chalk.red(`Error: Team "${name}" already exists`));
    process.exit(1);
  }

  const newTeam: Team = {
    name,
    issuerId,
    teamId,
    keyId,
    keyPath: expandedKeyPath,
    createdAt: new Date().toISOString()
  };

  config.teams.push(newTeam);
  await saveConfig(config);

  console.log(chalk.green(`✓ Team "${name}" added successfully`));
}

export async function listTeams(): Promise<void> {
  const config = await loadConfig();

  if (config.teams.length === 0) {
    console.log(chalk.yellow('No teams configured yet. Use "xcode-submit add" to add a team.'));
    return;
  }

  console.log(chalk.blue('\nConfigured Teams:'));
  console.log(chalk.blue('─'.repeat(50)));

  config.teams.forEach((team, index) => {
    console.log(chalk.cyan(`${index + 1}. ${team.name}`));
    console.log(chalk.gray(`   Issuer ID: ${team.issuerId}`));
    console.log(chalk.gray(`   Team ID: ${team.teamId}`));
    console.log(chalk.gray(`   Key ID: ${team.keyId}`));
    console.log(chalk.gray(`   Key Path: ${team.keyPath}`));
    console.log(chalk.gray(`   Created: ${new Date(team.createdAt).toLocaleString()}`));
    console.log();
  });
}