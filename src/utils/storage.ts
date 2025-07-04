import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Config } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.xcode-submit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function initializeStorage(): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  
  if (!(await fs.pathExists(CONFIG_FILE))) {
    const initialConfig: Config = { teams: [] };
    await fs.writeJson(CONFIG_FILE, initialConfig, { spaces: 2 });
  }
}

export async function loadConfig(): Promise<Config> {
  return await fs.readJson(CONFIG_FILE);
}

export async function saveConfig(config: Config): Promise<void> {
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function validateKeyPath(keyPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(keyPath);
    return stats.isFile() && path.extname(keyPath) === '.p8';
  } catch {
    return false;
  }
}