const MODULE_ID = "phils-clock-only";
const POSITION_KEY = "position";

const pad = (value) => String(value).padStart(2, "0");

function getCalendariaApi() {
  return globalThis.CALENDARIA?.api ?? null;
}

function getClockParts() {
  const now = getCalendariaApi()?.getCurrentDateTime?.();
  return {
    hour: Number(now?.hour ?? 0),
    minute: Number(now?.minute ?? 0),
    second: Number(now?.second ?? 0)
  };
}

function phaseFor(hour) {
  if (hour < 5) return "Night";
  if (hour < 8) return "Dawn";
  if (hour < 12) return "Morning";
  if (hour < 14) return "Noon";
  if (hour < 18) return "Afternoon";
  if (hour < 21) return "Dusk";
  return "Night";
}

function displayTime(hour, minute) {
  if (game.settings.get(MODULE_ID, "use24Hour")) return `${pad(hour)}:${pad(minute)}`;
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${pad(minute)} ${suffix}`;
}

function restorePosition(element) {
  const saved = game.settings.get(MODULE_ID, POSITION_KEY);
  if (saved?.left != null && saved?.top != null) {
    element.style.left = `${Math.min(saved.left, window.innerWidth - 90)}px`;
    element.style.top = `${Math.min(saved.top, window.innerHeight - 90)}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
  }
}

function makeDraggable(element, handle) {
  let active = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button")) return;
    const rect = element.getBoundingClientRect();
    active = true;
    moved = false;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!active) return;
    moved = true;
    const left = Math.max(8, Math.min(event.clientX - offsetX, window.innerWidth - element.offsetWidth - 8));
    const top = Math.max(8, Math.min(event.clientY - offsetY, window.innerHeight - element.offsetHeight - 8));
    Object.assign(element.style, { left: `${left}px`, top: `${top}px`, right: "auto", bottom: "auto" });
  });

  handle.addEventListener("pointerup", async (event) => {
    if (!active) return;
    active = false;
    handle.releasePointerCapture(event.pointerId);
    if (moved) {
      const rect = element.getBoundingClientRect();
      await game.settings.set(MODULE_ID, POSITION_KEY, { left: Math.round(rect.left), top: Math.round(rect.top) });
    }
  });
}

function updateClock(components = null) {
  const root = document.getElementById("pco-clock");
  if (!root) return;
  const current = components ?? getClockParts();
  const hour = Number(current?.hour ?? 0);
  const minute = Number(current?.minute ?? 0);
  const second = Number(current?.second ?? 0);
  root.querySelector(".pco-time").textContent = displayTime(hour, minute);
  root.querySelector(".pco-phase").textContent = phaseFor(hour);
  root.style.setProperty("--pco-hour-angle", `${(hour % 12) * 30 + minute * 0.5}deg`);
  root.style.setProperty("--pco-minute-angle", `${minute * 6 + second * 0.1}deg`);
  root.dataset.phase = phaseFor(hour).toLowerCase();
}

async function advanceTime(seconds) {
  const api = getCalendariaApi();
  if (!api?.canModifyTime?.()) return;
  await api.advanceTime(seconds);
}

function renderClock() {
  document.getElementById("pco-clock")?.remove();
  const root = document.createElement("section");
  root.id = "pco-clock";
  root.setAttribute("aria-label", "World time clock");
  root.innerHTML = `
    <div class="pco-face" title="Foundry world time">
      <div class="pco-sky"></div>
      <div class="pco-ticks"></div>
      <div class="pco-hand pco-hour-hand"></div>
      <div class="pco-hand pco-minute-hand"></div>
      <div class="pco-pin"></div>
      <div class="pco-readout">
        <strong class="pco-time">00:00</strong>
        <span class="pco-phase">Night</span>
      </div>
    </div>
    <div class="pco-bar">
      <button class="pco-toggle" type="button" title="Collapse or expand clock"><i class="fa-solid fa-clock"></i></button>
      <div class="pco-controls" aria-label="GM time controls">
        <button type="button" data-step="-3600" title="Back 1 hour">−1h</button>
        <button type="button" data-step="-600" title="Back 10 minutes">−10m</button>
        <button type="button" data-step="600" title="Forward 10 minutes">+10m</button>
        <button type="button" data-step="3600" title="Forward 1 hour">+1h</button>
      </div>
      <span class="pco-grip" title="Drag to move"><i class="fa-solid fa-grip-lines"></i></span>
    </div>`;
  document.body.append(root);
  if (!getCalendariaApi()?.canModifyTime?.()) root.querySelector(".pco-controls").remove();
  restorePosition(root);
  root.classList.toggle("collapsed", game.settings.get(MODULE_ID, "collapsed"));
  root.querySelector(".pco-toggle").addEventListener("click", async () => {
    const collapsed = !root.classList.contains("collapsed");
    root.classList.toggle("collapsed", collapsed);
    await game.settings.set(MODULE_ID, "collapsed", collapsed);
  });
  root.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => advanceTime(Number(button.dataset.step))));
  makeDraggable(root, root.querySelector(".pco-bar"));
  updateClock();
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "use24Hour", {
    name: "Use 24-hour time",
    hint: "Turn off to display a 12-hour clock with AM/PM.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: updateClock
  });
  game.settings.register(MODULE_ID, POSITION_KEY, { scope: "client", config: false, type: Object, default: {} });
  game.settings.register(MODULE_ID, "collapsed", { scope: "client", config: false, type: Boolean, default: false });
  game.settings.registerMenu(MODULE_ID, "resetPosition", {
    name: "Reset clock position",
    label: "Reset",
    hint: "Return the clock to the bottom-right corner.",
    icon: "fa-solid fa-arrow-rotate-left",
    type: class extends FormApplication {
      async render() {
        await game.settings.set(MODULE_ID, POSITION_KEY, {});
        renderClock();
        ui.notifications.info("Clock position reset.");
        return this;
      }
    },
    restricted: false
  });
});

Hooks.once("ready", () => {
  if (getCalendariaApi() && !document.getElementById("pco-clock")) renderClock();
});
Hooks.on("calendaria.ready", renderClock);
Hooks.on("calendaria.dateTimeChange", (data) => updateClock(data?.current));
Hooks.on("calendaria.calendarSwitched", () => updateClock());
Hooks.on("calendaria.visualTick", (data) => {
  const api = getCalendariaApi();
  const current = api?.timestampToDate?.(data?.predictedWorldTime);
  updateClock(current);
});

window.PhilsClockOnly = {
  toggle: () => document.getElementById("pco-clock")?.classList.toggle("hidden"),
  resetPosition: async () => {
    await game.settings.set(MODULE_ID, POSITION_KEY, {});
    renderClock();
  }
};
