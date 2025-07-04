export interface Team {
  name: string;
  issuerId: string;
  keyId: string;
  keyPath: string;
  createdAt: string;
}

export interface Config {
  teams: Team[];
}

export interface AddTeamOptions {
  name?: string;
  issuerId?: string;
  keyId?: string;
  keyPath?: string;
  nonInteractive?: boolean;
}