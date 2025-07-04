import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { Team, AddTeamOptions } from '../types';
import { initializeStorage as initStorage, loadConfig, saveConfig, validateKeyPath } from '../utils/storage';

export async function initializeStorage(): Promise<void> {
  await initStorage();
}

export async function addTeam(options: AddTeamOptions): Promise<void> {
  let { name, issuerId, keyPath, nonInteractive } = options;

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
        name: 'keyPath',
        message: 'Path to .p8 key file:',
        when: !keyPath,
        validate: async (input: string) => {
          if (!input.trim()) return 'Key path is required';
          const expandedPath = path.resolve(input.replace(/^~/, process.env.HOME || ''));
          const isValid = await validateKeyPath(expandedPath);
          return isValid || 'Invalid .p8 file path';
        }
      }
    ]);

    name = name || answers.name;
    issuerId = issuerId || answers.issuerId;
    keyPath = keyPath || answers.keyPath;
  }

  if (!name || !issuerId || !keyPath) {
    console.error(chalk.red('Error: All fields are required (name, issuer-id, key-path)'));
    process.exit(1);
  }

  const expandedKeyPath = path.resolve(keyPath.replace(/^~/, process.env.HOME || ''));
  
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
    console.log(chalk.gray(`   Key Path: ${team.keyPath}`));
    console.log(chalk.gray(`   Created: ${new Date(team.createdAt).toLocaleString()}`));
    console.log();
  });
}