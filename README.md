# Framer SEO Analyzer

A Framer plugin that analyzes your project for SEO best practices and provides actionable recommendations.

## Features

- **Page Title Analysis**: Checks if your page has a proper title and verifies its length follows SEO best practices.
- **Meta Description Check**: Analyzes meta descriptions for optimal length and presence.
- **Heading Structure**: Ensures proper heading hierarchy with a single H1 tag.
- **Image Alt Text**: Identifies images missing alt text for better accessibility and SEO.
- **Mobile Responsiveness**: Checks for indications of mobile-friendly design.

## How to Use

1. Install the plugin in Framer
2. Open your Framer project
3. Click on the SEO Analyzer icon in the plugin panel
4. Click "Analyze SEO" to get instant recommendations

## SEO Best Practices Implemented

- **Page Titles**: Should be 50-60 characters long
- **Meta Descriptions**: Should be 120-155 characters long
- **Heading Structure**: Each page should have one main H1 heading
- **Alt Text**: All non-decorative images should have descriptive alt text
- **Mobile-Friendly**: Pages should be responsive for mobile devices

## Development

This plugin is built with React and the Framer Plugin API.

To develop:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

To build:

```
npm run build
```

To package for distribution:

```
npm run pack
```

## License

MIT
