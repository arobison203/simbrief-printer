# SimBrief Printer Website

This is the download website for SimBrief Printer, deployed to GitHub Pages.

## Development

```bash
pnpm install  # From website directory
pnpm dev      # Start dev server
pnpm build    # Build for production
```

Or from the root directory:

```bash
pnpm website:dev
pnpm website:build
```

## Deployment

The website is automatically deployed to GitHub Pages on push to main branch via `.github/workflows/deploy-website.yml`.

Built files are output to `dist/` directory.
