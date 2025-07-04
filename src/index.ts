#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addTeam, listTeams, initializeStorage } from './commands/teams';
import { version } from '../package.json';

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

program.parse();