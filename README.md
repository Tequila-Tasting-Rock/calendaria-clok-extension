# Phil-Style Clock

A standalone Foundry VTT clock visually inspired by the clock in Phil's Day&Night Cycle.

## Features

- Clock only.
- Uses Calendaria time when Calendaria is active.
- Falls back to Foundry World Time when Calendaria is unavailable.
- 24-hour digital time display.
- Segmented circular clock face.
- Day-phase indicator.
- Draggable positioning.
- Collapsible clock face.
- Smart / Above / Below / Left / Right orientation.
- Persistent client-side position and orientation.

## Installation

### Recommended

Install through Foundry using this manifest URL:

`https://github.com/YOUR_USERNAME/phil-style-clock/releases/latest/download/module.json`

### Development

Clone this repository into:

`FoundryVTT/Data/modules/phil-style-clock/`

## Calendaria

Calendaria is recommended, not required. When active, the clock reads the calendar-aware time exposed by Calendaria.

## Releases

Releases are created from GitHub tags in the form:

`v1.0.0`

The GitHub Action generates:

- `module.json`
- `module.zip`

The generated release manifest points to that exact release's ZIP. The stable manifest URL always points to the latest release.

## License

GPL-3.0-or-later for this implementation.

This project does not include Phil's original artwork/assets. It is an independent implementation inspired by the visual behavior of the referenced module.
