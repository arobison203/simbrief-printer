# SimBrief Printer

A desktop application for fetching SimBrief OFP (Operational Flight Plan) data and printing it to thermal receipt printers over the network.

## Features

- 🖨️ **Network Thermal Printer Support** - Print directly to 80mm thermal printers via IP connection
- ✈️ **SimBrief Integration** - Fetch your latest flight plan using your SimBrief username
- 📄 **Receipt-Style Format** - Clean, compact layout optimized for thermal printers
- 🔄 **Unit Conversion** - Toggle between pounds (LBS) and kilograms (KG)
- 👀 **Live Preview** - See exactly what will print before sending to the printer
- 🔌 **Connection Testing** - Test printer connectivity before printing

### Included Flight Data

- Flight information (airline, callsign, flight number, aircraft type)
- Routing (departure, destination, alternate airports)
- Complete route with airways and waypoints
- Fuel planning (trip, taxi, contingency, alternate, reserve, extra, total)
- Weight and balance (ZFW, TOW, landing weight, passengers, cargo)
- Weather (METAR for origin, destination, and alternate)
- Performance data (cruise altitude, cruise speed)

## Installation

### Requirements

- macOS, Windows, or Linux
- Network-connected thermal printer (ESC/POS compatible, 80mm paper width)
- SimBrief account with active flight plans

### Download

Download the latest release for your platform from the [Releases](../../releases) page:

- **macOS**: `.dmg` or `.app` bundle
- **Windows**: `.msi` installer or `.exe`
- **Linux**: `.AppImage` or `.deb` package

## Usage

### 1. Configure Printer Settings

1. Enter your thermal printer's IP address (e.g., `10.203.10.197`)
2. Enter the printer port (typically `9100` for raw TCP/IP printing)
3. Click **Test Connection** to verify connectivity

### 2. Fetch Flight Plan

1. Enter your SimBrief username in the input field
2. Click **Fetch Flight Plan** (or press Enter)
3. Your most recent OFP will be loaded and displayed in the preview

### 3. Customize & Print

1. Toggle between **LBS** and **KG** units if desired
2. Review the preview to ensure everything looks correct
3. Click **Print** to send the job to your thermal printer

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Rust](https://www.rust-lang.org/) (for Tauri)
- Platform-specific dependencies for Tauri (see [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/simbrief-printer.git
   cd simbrief-printer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run in development mode:
   ```bash
   pnpm dev
   ```

### Building

To create a production build:

```bash
pnpm build
```

The compiled application will be in `src-tauri/target/release/bundle/`.

### Project Structure

```
simbrief-printer/
├── src/
│   ├── components/
│   │   └── PrintPreview.tsx    # Preview component
│   ├── utils/
│   │   └── escposFormatter.ts  # ESC/POS formatting logic
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # React entry point
│   ├── index.css               # Styles
│   └── types.ts                # TypeScript definitions
├── src-tauri/
│   ├── src/
│   │   └── main.rs             # Tauri backend (Rust)
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Technology Stack

- **[Tauri](https://tauri.app/)** - Desktop application framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Rust** - Native backend for network printing

## Printer Compatibility

This app is designed for **ESC/POS compatible thermal printers** with:
- 80mm paper width (48 characters per line)
- Raw TCP/IP network connection (port 9100)
- Support for standard ESC/POS commands

### Tested Printers

- Epson TM series
- Star Micronics TSP series
- Generic ESC/POS thermal printers

## Troubleshooting

### Connection Issues

- Ensure the printer is powered on and connected to the same network
- Verify the IP address is correct
- Check that port 9100 is not blocked by a firewall
- Use the **Test Connection** button to diagnose issues

### Printing Issues

- Verify the printer supports ESC/POS commands
- Check paper is loaded correctly
- Ensure printer is not in an error state (paper jam, cover open, etc.)

### No OFP Data

- Verify your SimBrief username is correct
- Ensure you have an active flight plan on SimBrief
- Check your internet connection

## Future Enhancements

- [ ] USB printer support
- [ ] Multiple printer profiles
- [ ] Save/load previous flight plans
- [ ] Custom formatting options
- [ ] Export to PDF
- [ ] NOTAMS and weather briefing sections

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [SimBrief](https://www.simbrief.com/) for their excellent flight planning API
- [Tauri](https://tauri.app/) for the desktop application framework