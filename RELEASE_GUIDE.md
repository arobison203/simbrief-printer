# Release Guide

This guide explains how to create releases for SimBrief Printer with automatic cross-platform builds and auto-updates.

## Overview

SimBrief Printer uses:
- **GitHub Actions** for automated cross-platform builds
- **GitHub Releases** for distribution
- **Tauri Updater** for automatic updates

When you create a git tag, GitHub Actions automatically builds for:
- macOS (Apple Silicon + Intel)
- Windows (x64)
- Linux (AppImage + .deb)

## Prerequisites

### First-Time Setup

1. **Generate Tauri Signing Keys** (for secure updates)

   Run this command once:
   ```bash
   pnpm tauri signer generate -w ~/.tauri/myapp.key
   ```

   This will output:
   - A private key saved to `~/.tauri/myapp.key`
   - A public key (starts with `dW50cnVzdGVk...`)

2. **Add GitHub Secrets**

   Go to your GitHub repo → Settings → Secrets and variables → Actions

   Add these secrets:
   - `TAURI_SIGNING_PRIVATE_KEY`: Paste the entire contents of `~/.tauri/myapp.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: The password you entered when generating the key

3. **Update Public Key in Config**

   Edit `src-tauri/tauri.conf.json` and replace the `pubkey` value in the `updater` section with your public key.

4. **Update Repository Info**

   In `src-tauri/tauri.conf.json`, update the `updater.endpoints` URL to match your GitHub username/repo:
   ```json
   "endpoints": [
     "https://github.com/YOUR_USERNAME/simbrief-printer/releases/latest/download/latest.json"
   ]
   ```

## Creating a Release

### 1. Update Version Number

Edit the version in **both** files:

**src-tauri/tauri.conf.json:**
```json
{
  "version": "1.0.0"
}
```

**src-tauri/Cargo.toml:**
```toml
[package]
version = "1.0.0"
```

### 2. Update CHANGELOG.md

Document what's new, fixed, or changed in this release.

### 3. Commit Changes

```bash
git add .
git commit -m "chore: bump version to v1.0.0"
git push
```

### 4. Create and Push a Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

**Important:** The tag MUST start with `v` (e.g., `v1.0.0`, `v1.2.3`, `v2.0.0-beta.1`)

### 5. Wait for GitHub Actions

The workflow will:
1. Build for all platforms (takes ~10-20 minutes)
2. Create a draft release on GitHub
3. Upload all installers to the release
4. Generate `latest.json` for auto-updates

### 6. Edit and Publish the Release

1. Go to your GitHub repo → Releases
2. Find the draft release
3. Edit the release notes if needed
4. Click **Publish release**

## What Gets Built

Each release includes:

### macOS
- `SimBrief-Printer_1.0.0_aarch64.dmg` - Apple Silicon (M1/M2/M3)
- `SimBrief-Printer_1.0.0_x86_64.dmg` - Intel Macs
- `.app.tar.gz` - Alternative format

### Windows
- `SimBrief-Printer_1.0.0_x64-setup.exe` - EXE installer
- `SimBrief-Printer_1.0.0_x64_en-US.msi` - MSI installer

### Linux
- `simbrief-printer_1.0.0_amd64.AppImage` - Universal Linux (recommended)
- `simbrief-printer_1.0.0_amd64.deb` - Debian/Ubuntu package

### Update Files
- `latest.json` - Auto-update manifest
- `.sig` files - Signatures for secure updates

## Auto-Updates

Once published, the app will automatically:
1. Check for updates on launch
2. Show a dialog if an update is available
3. Download and install the update
4. Prompt the user to restart

Users can also manually check for updates from the app menu (Help → Check for Updates).

## Testing Locally

Before creating a release, test the build locally:

```bash
# Test development build
pnpm dev

# Test production build
pnpm build
```

The production bundles will be in:
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/` or `nsis/`
- Linux: `src-tauri/target/release/bundle/appimage/` or `deb/`

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Pre-releases

For beta/alpha releases, append a suffix:
- `v1.0.0-beta.1`
- `v1.0.0-rc.2`

Mark these as "pre-release" on GitHub.

## Troubleshooting

### Build Fails on GitHub Actions

**Check the Actions tab** to see which platform failed and why.

Common issues:
- **macOS**: Missing targets - ensure Rust targets are installed
- **Windows**: Code signing issues - check secrets are set correctly
- **Linux**: Missing system dependencies - workflow installs them automatically

### Auto-Updates Not Working

1. Verify `pubkey` in `tauri.conf.json` matches your generated public key
2. Check the `endpoints` URL points to your GitHub repo
3. Ensure the release is published (not draft)
4. Verify `latest.json` exists in the release assets

### Users Can't Open macOS App

First-time users may see "App can't be opened" due to Gatekeeper.

**Solution:** Right-click → Open (or System Settings → Privacy & Security)

For future releases, consider code signing with an Apple Developer account.

## Manual Release (No Auto-Update)

If you don't want auto-updates:

1. Remove the `updater` section from `src-tauri/tauri.conf.json`
2. Remove the `tauri-plugin-updater` plugin from `src-tauri/src/lib.rs`
3. Remove `tauri-plugin-updater` from `src-tauri/Cargo.toml`
4. Users will need to manually download new versions

## GitHub Actions Workflow

The workflow is defined in `.github/workflows/release.yml`

It runs when:
- You push a tag starting with `v`
- You manually trigger it from the Actions tab

To disable auto-releases, delete this file.

## Tips

- **Test before releasing:** Always test the app locally with `pnpm build`
- **Keep changelogs:** Users appreciate knowing what's new
- **Version carefully:** Can't un-publish a version (users may auto-update)
- **Monitor releases:** Check GitHub Actions logs if builds fail
- **Beta test:** Use pre-release tags for testing with a small group

## Support

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Tauri Updater Guide](https://tauri.app/v1/guides/distribution/updater)
- [GitHub Actions for Tauri](https://github.com/tauri-apps/tauri-action)