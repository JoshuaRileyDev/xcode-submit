#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addTeam, listTeams, initializeStorage } from './commands/teams.js';
import { buildAndExport } from './commands/build.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('xcode-submit')
  .description('CLI tool for managing App Store Connect API teams')
  .version(version);

program
  .command('add')
  .description('Add a new team')
  .option('-n, --name <name>', 'team reference name')
  .option('-i, --issuer-id <issuerId>', 'issuer ID')
  .option('-t, --team-id <teamId>', 'team ID')
  .option('--key-id <keyId>', 'key ID')
  .option('-k, --key-path <keyPath>', 'path to .p8 key file')
  .option('--non-interactive', 'run in non-interactive mode')
  .action(async (options) => {
    try {
      await initializeStorage();
      await addTeam(options);
    } catch (error) {
      console.error(chalk.red('Error adding team:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all teams')
  .action(async () => {
    try {
      await initializeStorage();
      await listTeams();
    } catch (error) {
      console.error(chalk.red('Error listing teams:'), error);
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build and export Xcode project for App Store submission')
  .option('-t, --team <teamName>', 'team reference name')
  .option('-s, --scheme <schemeName>', 'Xcode scheme name')
  .action(async (options) => {
    try {
      await initializeStorage();
      await buildAndExport(options);
    } catch (error) {
      console.error(chalk.red('Error building project:'), error);
      process.exit(1);
    }
  });

program.parse();