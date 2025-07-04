# Xcode Submit

A CLI tool for managing App Store Connect API teams. Store and manage your team configurations including issuer IDs and API key paths.

## Installation

```bash
npm install -g xcode-submit
```

## Usage

### Add a Team (Interactive Mode)

```bash
xcode-submit add
```

### Add a Team (Non-Interactive Mode)

```bash
xcode-submit add --name "My Team" --issuer-id "your-issuer-id" --key-id "your-key-id" --key-path "~/path/to/key.p8" --non-interactive
```

### List Teams

```bash
xcode-submit list
```

## Configuration

Team configurations are stored in `~/.xcode-submit/config.json`.

Each team includes:
- Reference name
- Issuer ID (from App Store Connect)
- Key ID (from App Store Connect API key)
- Path to .p8 API key file

## Development

```bash
npm run dev        # Run in development mode
npm run build      # Build TypeScript
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```