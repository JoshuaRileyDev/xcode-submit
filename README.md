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
xcode-submit add --name "My Team" --issuer-id "your-issuer-id" --team-id "your-team-id" --key-id "your-key-id" --key-path "~/path/to/key.p8" --non-interactive
```

### List Teams

```bash
xcode-submit list
```

### Build and Export for App Store

```bash
# Interactive mode
xcode-submit build

# Non-interactive mode
xcode-submit build --team "My Team" --scheme "MyScheme"
```

## Configuration

Team configurations are stored in `~/.xcode-submit/config.json`.

Each team includes:
- Reference name
- Issuer ID (from App Store Connect)
- Team ID (from App Store Connect)
- Key ID (from App Store Connect API key)
- Path to .p8 API key file

## Build Process

The `build` command automatically:
1. Detects Xcode project/workspace in current directory
2. Creates temporary build directory in `~/.xcode-submit/tmp/`
3. Generates `exportOptions.plist` with team configuration
4. Runs `xcodebuild clean archive` for Release configuration
5. Runs `xcodebuild -exportArchive` for App Store distribution
6. Provides paths to generated files

Build artifacts are stored temporarily and cleaned up on subsequent builds.

## Development

```bash
npm run dev        # Run in development mode
npm run build      # Build TypeScript
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```