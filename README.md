# SimBrief Printer

A desktop application for fetching SimBrief OFP (Operational Flight Plan) data and printing it to thermal receipt printers.

**Download:** [arobison203.github.io/simbrief-printer](https://arobison203.github.io/simbrief-printer)

## DISCLAIMER
This was probably 95% vibe-coded. I have exactly zero Rust experience, and I have no idea how ESC/POS printers actually work, but Claude seemed to have a pretty good grasp. This was just a fun project because I like flight simulators and I got tired of swapping between tabs all the time to look at my dispatch info. If you encounter any issues or have suggestions for improvement, please feel free to open an issue or submit a pull request.

## Features

- 🖨️ **Dual Connection Support** - Network (TCP/IP) or USB system printer
- 📏 **Multiple Paper Sizes** - 58mm and 80mm thermal printers
- ✈️ **SimBrief Integration** - Fetch flight plans via username
- 📄 **Receipt-Style Format** - Clean layout optimized for thermal printers
- 🔄 **Unit Conversion** - Toggle between LBS and KG
- 👀 **Live Preview** - See exactly what will print
- 🔌 **Connection Testing** - Verify printer before use
- ✂️ **Cutter Position Adjustment** - Fine-tune where paper cuts

## Installation

Download the latest release from the [Releases](../../releases) page:
- **macOS**: `.dmg` (Apple Silicon or Intel)
- **Windows**: `.msi` or `.exe`
- **Linux**: `.AppImage` or `.deb`

**First launch tips:**
- macOS: Right-click → Open if blocked by Gatekeeper
- Linux: `chmod +x simbrief-printer_*.AppImage` before running

Auto-updates are checked on launch, or manually via **Help → Check for Updates**

## Usage

### Network Printer (TCP/IP)
1. Select LAN connection type
2. Enter printer IP address and port (default 9100)
3. Test connection
4. Fetch SimBrief flight plan
5. Preview and print

### USB Printer
1. Select USB connection type
2. Install printer driver on your system (if needed)
3. Select printer from dropdown
4. Test connection
5. Fetch SimBrief flight plan
6. Preview and print

### Printer Setup
- **Paper width**: Choose 58mm or 80mm based on your printer
- **Cutter position**: Adjust trailing blank lines until paper cuts cleanly at tear bar

## Printer Compatibility

### Network Printers
ESC/POS compatible thermal printers with raw TCP/IP (port 9100):
- Tested: Rongta RP326
- Should work with most similar ESC/POS printers

### USB Printers
Any thermal printer installed as a system printer (via CUPS on macOS/Linux or WinSpool on Windows)

Both 58mm and 80mm widths supported.

## Development

```bash
pnpm install
pnpm dev     # Development
pnpm build   # Production build
```

**Stack:** Tauri 2, React 18, TypeScript, Tailwind CSS 4, DaisyUI 5, Rust

## Contributing

PRs welcome! See [RELEASE_GUIDE.md](RELEASE_GUIDE.md) for release instructions.

## License

MIT - see LICENSE file for details. Forks appreciated with a mention.

## Acknowledgments

[SimBrief](https://www.simbrief.com/) for their flight planner and JSON API.
