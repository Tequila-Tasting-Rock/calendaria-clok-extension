# Phil's Clock Only

A standalone Foundry VTT clock inspired by the segmented clock presentation in Phil's Day & Night Cycle. Calendaria supplies all calendar and world-time data; this module supplies only the clock interface.

## Included

- Calendaria time and active-calendar synchronization
- Smooth display updates while Calendaria's real-time clock is running
- Segmented day/night clock face with analog hands
- 12-hour or 24-hour digital readout
- Draggable, client-specific position
- Collapsible clock face
- Calendaria-permission-aware controls for ±10 minutes and ±1 hour
- Foundry VTT 13.351–14 compatibility

## Not included

Calendar, weather, wind, moon phases, scene darkness, lighting automation, particles, chat cards, journals, events, or other day/night module systems.

## Install

1. Install and enable **Calendaria**.
2. Extract the `phils-clock-only` folder into Foundry's `Data/modules` directory.
3. Restart Foundry VTT.
4. Enable **Phil's Clock Only** in your world. Foundry will enforce Calendaria as a required dependency.

The clock appears at the bottom-right. Drag its lower bar to move it, or click the clock icon to collapse it.

## Optional macro API

```js
window.PhilsClockOnly.toggle();
window.PhilsClockOnly.resetPosition();
```

This is an independent, minimal implementation and does not contain the original module's weather/calendar systems or bundled artwork.
