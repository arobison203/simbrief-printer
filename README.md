# SimBrief Printer

A React web application that fetches your SimBrief OFP (Operational Flight Plan) and displays it in a clean, receipt-printer-friendly format.

## Features

- Fetches OFP data from SimBrief API using your username
- Displays essential flight information in a compact, receipt-style format
- Optimized for narrow thermal receipt printers
- Clean preview before printing
- No installation required - runs in your browser
- Includes:
  - Flight information (airline, flight number, aircraft)
  - Routing (departure, destination, alternate)
  - Complete route
  - Fuel planning (trip, taxi, contingency, alternate, reserve, extra)
  - Weights and load information
  - Weather (METAR for origin, destination, and alternate)
  - Performance data

## Live Demo

Visit the live app at: `https://simbrief-printer.pages.dev`

## Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm run dev
   ```
4. Open your browser to `http://localhost:5173`

## Usage

1. Enter your SimBrief username in the input field
2. Click "Fetch OFP" or press Enter
3. Review the OFP preview
4. Click "Print" to send to your printer

## Deployment

### Cloudflare Pages

This app is designed to deploy to Cloudflare Pages with serverless functions.

#### Setup

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Create a new project and connect your GitHub repository
4. Configure build settings:
   - Build command: `pnpm run build`
   - Build output directory: `dist`
   - Root directory: (leave empty)
5. Deploy!

The `functions/api/fetch-ofp.ts` file will automatically deploy as a serverless function at `/api/fetch-ofp`.

#### Automatic Deployment (GitHub Actions)

Alternatively, use the included GitHub Actions workflow:

1. Add secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare Dashboard → My Profile → API Tokens
   - `CLOUDFLARE_ACCOUNT_ID` - Get from Cloudflare Dashboard → Workers & Pages → Account ID
2. Push to `main` branch
3. GitHub Actions will build and deploy automatically

#### Local Development

The Cloudflare Pages Function works in development:

```bash
pnpm run dev
# API available at /api/fetch-ofp?username=YOUR_USERNAME
```

## How It Works

The app uses a Cloudflare Pages Function (serverless edge function) to proxy requests to the SimBrief API. This avoids CORS issues that would occur if fetching directly from the browser.

```
Browser → /api/fetch-ofp → Cloudflare Function → SimBrief API → Browser
```

## Configuration

The app is pre-configured to work with receipt printers (80mm width). When printing:
- The layout automatically adjusts for narrow paper
- Font size is optimized for thermal printers
- Use your system's print dialog to select your receipt printer

## API Usage

This app uses the SimBrief API:
- Endpoint: `https://www.simbrief.com/api/xml.fetcher.php?username=XXX&json=1`
- No API key required for basic usage
- Uses your SimBrief username to fetch your most recent flight plan

## Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety and better developer experience
- **Vite 5** - Fast build tool and development server
- **Cloudflare Pages** - Free hosting with serverless edge functions
- **Cloudflare Workers** - Serverless API proxy (in-house, no third-party dependencies)
- **GitHub Actions** - Automated deployment pipeline (optional)

### Development Scripts

```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build locally
```

## Printing Tips

For best results with thermal receipt printers:
1. Select your receipt printer in the print dialog
2. Set paper size to 80mm (or your printer's width)
3. Ensure margins are set to minimum
4. Use "Actual Size" or "100%" scaling

## Project Structure

```
simbrief-printer/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions for Cloudflare Pages
├── functions/
│   └── api/
│       └── fetch-ofp.ts      # Cloudflare Pages Function (API proxy)
├── src/
│   ├── components/
│   │   └── OFPDisplay.tsx    # OFP rendering component
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Styles (including print styles)
│   ├── types.ts              # TypeScript type definitions for SimBrief API
│   └── vite-env.d.ts         # Vite type definitions
├── dist/                     # Build output (generated)
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── DEPLOYMENT.md             # Deployment instructions
└── README.md                 # This file
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses Fetch API for SimBrief requests

## Future Enhancements

- [ ] Save OFPs locally (localStorage)
- [ ] Support for multiple flight plans
- [ ] Customizable layout options
- [ ] Export to PDF
- [ ] Additional data fields (NOTAMS, route charts, etc.)
- [ ] Dark mode support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT