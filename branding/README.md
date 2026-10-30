# FlightNudge Branding

This folder contains branding assets for FlightNudge.

## Files

- `logo.svg` - Vector logo (scalable)
- `icon-128.png` - 128x128 icon for add-on manifest
- `icon-512.png` - 512x512 icon for marketplace listing

## Colors

- Primary Blue: `rgba(157,214,252,1)` (#9DD6FC)
- Purple: `rgb(202,160,250)` (#CAA0FA)
- Gradient: `rgba(209,127,247,1)` → `rgba(157,214,252,1)`

## Design

The logo features:
- An airplane symbol representing flights
- A notification bell representing reminders
- Gradient background in brand colors
- Clean, modern design suitable for Google Workspace

## Usage

Use these assets in:
- Google Workspace Marketplace listing
- Add-on manifest (appsscript.json)
- Marketing materials
- Documentation

To generate PNG files from SVG, use ImageMagick or similar:
```bash
convert -density 300 logo.svg -resize 128x128 icon-128.png
convert -density 300 logo.svg -resize 512x512 icon-512.png
```
