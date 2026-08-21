
const MODULE_ID = "phil-style-clock";

class PhilStyleClock {
  constructor() {
    this.el = null;
    this.face = null;
    this.icon = null;
    this.timeEl = null;
    this.phaseEl = null;
    this.pointer = null;
    this.expanded = true;
    this.orientation = "smart";
    this.drag = null;
    this.lastWorldTime = null;
  }

  static init() {
    Hooks.once("ready", () => {
      if (!game.settings.get(MODULE_ID, "enabled")) return;
      window.PhilStyleClock = new PhilStyleClock();
      window.PhilStyleClock.render();
    });
  }

  registerSettings() {
    game.settings.register(MODULE_ID, "enabled", {
      name: "Enable Clock",
      hint: "Show the standalone clock.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.refresh()
    });
  }

  render() {
    if (this.el) this.el.remove();

    const wrap = document.createElement("div");
    wrap.id = "phil-style-clock";
    wrap.className = "psc-widget expanded orientation-smart";
    wrap.innerHTML = `
      <div class="psc-shell">
        <div class="psc-arrow">⌃</div>

        <div class="psc-clock-face" title="Click to collapse/expand">
          <div class="psc-segments" aria-hidden="true">
            ${Array.from({length: 8}, (_, i) => `<div class="psc-segment s${i}"></div>`).join("")}
          </div>
          <div class="psc-inner-ring"></div>
          <div class="psc-center">
            <div class="psc-time">00:00</div>
            <div class="psc-phase">Night</div>
          </div>
          <div class="psc-hand">
            <div class="psc-hand-line"></div>
            <div class="psc-hand-dot"></div>
          </div>
        </div>

        <button class="psc-icon" type="button" aria-label="Toggle clock">
          <span class="psc-icon-face">◷</span>
        </button>

        <div class="psc-popover" hidden>
          <button data-orientation="above">Above</button>
          <button data-orientation="below">Below</button>
          <button data-orientation="left">Left</button>
          <button data-orientation="right">Right</button>
          <button data-orientation="smart">Smart</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);
    this.el = wrap;
    this.face = wrap.querySelector(".psc-clock-face");
    this.icon = wrap.querySelector(".psc-icon");
    this.timeEl = wrap.querySelector(".psc-time");
    this.phaseEl = wrap.querySelector(".psc-phase");
    this.pointer = wrap.querySelector(".psc-hand");

    this.loadPosition();
    this.bindEvents();
    this.update();
    this.startTicker();
  }

  bindEvents() {
    this.icon.addEventListener("click", (ev) => {
      ev.stopPropagation();
      this.expanded = !this.expanded;
      this.el.classList.toggle("collapsed", !this.expanded);
      this.el.classList.toggle("expanded", this.expanded);
      this.applyOrientation();
    });

    this.icon.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const menu = this.el.querySelector(".psc-popover");
      menu.hidden = !menu.hidden;
    });

    this.face.addEventListener("contextmenu", (ev) => ev.preventDefault());

    this.el.querySelectorAll(".psc-popover button").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        this.orientation = ev.currentTarget.dataset.orientation;
        game.settings.set(MODULE_ID, "orientation", this.orientation);
        this.el.querySelector(".psc-popover").hidden = true;
        this.applyOrientation();
      });
    });

    this.el.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0 || ev.target.closest(".psc-popover")) return;
      this.drag = {
        startX: ev.clientX,
        startY: ev.clientY,
        left: this.el.offsetLeft,
        top: this.el.offsetTop
      };
      this.el.setPointerCapture(ev.pointerId);
      this.el.classList.add("dragging");
    });

    this.el.addEventListener("pointermove", (ev) => {
      if (!this.drag) return;
      const dx = ev.clientX - this.drag.startX;
      const dy = ev.clientY - this.drag.startY;
      this.el.style.left = `${this.drag.left + dx}px`;
      this.el.style.top = `${this.drag.top + dy}px`;
      this.el.style.right = "auto";
      this.el.style.bottom = "auto";
    });

    this.el.addEventListener("pointerup", (ev) => {
      if (!this.drag) return;
      this.drag = null;
      this.el.classList.remove("dragging");
      this.savePosition();
      this.applyOrientation();
    });

    window.addEventListener("resize", () => this.applyOrientation());
  }

  startTicker() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.update(), 1000);
  }

  update() {
    if (!this.el || !game.time) return;

    const worldTime = Number(game.time.worldTime) || 0;
    if (worldTime === this.lastWorldTime && this.timeEl.textContent) return;
    this.lastWorldTime = worldTime;

    const secondsPerDay = 86400;
    const daySeconds = ((worldTime % secondsPerDay) + secondsPerDay) % secondsPerDay;
    const hours = Math.floor(daySeconds / 3600);
    const minutes = Math.floor((daySeconds % 3600) / 60);
    const seconds = Math.floor(daySeconds % 60);

    this.timeEl.textContent =
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const phase = this.getPhase(hours + minutes / 60);
    this.phaseEl.textContent = phase.name;

    // 8 visual sectors, with a smooth hand around the full 24-hour cycle.
    const fraction = daySeconds / secondsPerDay;
    const degrees = fraction * 360 - 90;
    this.pointer.style.transform = `rotate(${degrees}deg)`;

    this.el.dataset.phase = phase.key;
    this.el.style.setProperty("--phase-accent", phase.color);
    this.el.style.setProperty("--phase-glow", phase.glow);

    const segments = this.el.querySelectorAll(".psc-segment");
    const active = Math.floor(fraction * 8) % 8;
    segments.forEach((s, i) => s.classList.toggle("active", i === active));

    this.applyOrientation();
  }

  getPhase(hour) {
    // Eight broad visual phases to match the segmented-clock concept.
    if (hour >= 5 && hour < 7) return {key:"dawn", name:"Dawn", color:"#d89b63", glow:"#b86b3f"};
    if (hour >= 7 && hour < 11) return {key:"morning", name:"Morning", color:"#e4bf77", glow:"#a47a3e"};
    if (hour >= 11 && hour < 14) return {key:"noon", name:"Noon", color:"#d7c277", glow:"#9e8b46"};
    if (hour >= 14 && hour < 18) return {key:"afternoon", name:"Afternoon", color:"#c98e5a", glow:"#8d5632"};
    if (hour >= 18 && hour < 20) return {key:"dusk", name:"Dusk", color:"#8d5961", glow:"#633b4a"};
    if (hour >= 20 && hour < 24) return {key:"evening", name:"Evening", color:"#56627d", glow:"#35415e"};
    if (hour >= 0 && hour < 5) return {key:"night", name:"Night", color:"#46516d", glow:"#273149"};
    return {key:"night", name:"Night", color:"#46516d", glow:"#273149"};
  }

  applyOrientation() {
    if (!this.el) return;
    this.el.classList.remove(
      "orientation-above","orientation-below",
      "orientation-left","orientation-right","orientation-smart"
    );

    let o = this.orientation;
    if (o === "smart") {
      const r = this.el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      if (r.top < 180) o = "below";
      else if (r.bottom > vh - 180) o = "above";
      else if (r.left < 220) o = "right";
      else if (r.right > vw - 220) o = "left";
      else o = "above";
      this.el.classList.add("orientation-smart");
    }
    this.el.classList.add(`orientation-${o}`);
  }

  savePosition() {
    const rect = this.el.getBoundingClientRect();
    game.settings.set(MODULE_ID, "position", {
      left: Math.max(0, Math.round(rect.left)),
      top: Math.max(0, Math.round(rect.top))
    });
  }

  loadPosition() {
    const p = game.settings.get(MODULE_ID, "position");
    this.orientation = game.settings.get(MODULE_ID, "orientation") || "smart";
    if (p && Number.isFinite(p.left) && Number.isFinite(p.top)) {
      this.el.style.left = `${p.left}px`;
      this.el.style.top = `${p.top}px`;
      this.el.style.right = "auto";
      this.el.style.bottom = "auto";
    }
  }

  refresh() {
    if (!game.settings.get(MODULE_ID, "enabled")) {
      this.el?.remove();
      this.el = null;
      return;
    }
    this.render();
  }

  toggle() {
    this.el?.classList.toggle("hidden");
  }

  toggleClockFace() {
    this.expanded = !this.expanded;
    this.el?.classList.toggle("collapsed", !this.expanded);
    this.el?.classList.toggle("expanded", this.expanded);
    this.applyOrientation();
  }

  resetPosition() {
    if (!this.el) return;
    this.el.style.left = "auto";
    this.el.style.top = "auto";
    this.el.style.right = "22px";
    this.el.style.bottom = "22px";
    game.settings.set(MODULE_ID, "position", {left: null, top: null});
    this.applyOrientation();
  }

  setTime(hour, minute = 0) {
    if (!game.user.isGM) return ui.notifications.warn("Only the GM can change World Time.");
    const now = Number(game.time.worldTime) || 0;
    const day = Math.floor(now / 86400);
    const target = day * 86400 + Number(hour) * 3600 + Number(minute) * 60;
    return game.time.advance(target - now);
  }
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "enabled", {
    name: "Enable Clock",
    hint: "Show the standalone clock.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, "orientation", {
    name: "Clock Orientation",
    scope: "client",
    config: false,
    type: String,
    default: "smart"
  });

  game.settings.register(MODULE_ID, "position", {
    name: "Clock Position",
    scope: "client",
    config: false,
    type: Object,
    default: {left: null, top: null}
  });
});

Hooks.once("ready", () => {
  if (game.settings.get(MODULE_ID, "enabled")) {
    window.PhilStyleClock = new PhilStyleClock();
    window.PhilStyleClock.render();
  }
});
