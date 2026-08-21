# Phil-Style Clock

A standalone Foundry VTT clock inspired by the visual concept and interaction pattern of Phil's Day&Night Cycle.

## Included
- Foundry `game.time.worldTime` synchronization
- 24-hour display
- 8-segment day/night face
- Day-phase label
- Rotating time hand
- Collapsible clock face
- Drag-and-drop positioning
- Smart / Above / Below / Left / Right orientation
- Right-click orientation selector
- Persistent position and orientation

## Not included
Calendar, weather, weather FX, lighting control, moon phases, events, notes, climate systems, or Simple Calendar integration.

## Installation
Copy the `phil-style-clock` folder into:

`FoundryVTT/Data/modules/`

Then enable **Phil-Style Clock** in your world.

## Macro API
```js
window.PhilStyleClock.toggle();
window.PhilStyleClock.toggleClockFace();
window.PhilStyleClock.resetPosition();
window.PhilStyleClock.setTime(12, 0);
```

`setTime()` changes Foundry World Time and is GM-only.

## License
This implementation is independent code. It does not include Phil's original artwork/assets.
The referenced project is used only as a behavioral and visual reference.


## Calendaria integration

When **Calendaria** is enabled, this clock automatically uses:

- `CALENDARIA.api.getCurrentDateTime()` for the displayed time.
- The active calendar's `hoursPerDay`, `minutesPerHour`, and `secondsPerMinute` for clock rotation.
- `CALENDARIA.api.getSunrise()` / `getSunset()` for the visual day phase when available.
- `CALENDARIA.api.setDateTime()` when using the module's `setTime()` macro.

This means the clock follows Calendaria's calendar rather than assuming a fixed 24-hour Gregorian day. Calendaria itself uses Foundry's time components and exposes its public API for integrations.
