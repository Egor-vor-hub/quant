const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Scroll-reveal ---------- */
const revealTargets = document.querySelectorAll(".reveal");
revealTargets.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 90}ms`; });
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
revealTargets.forEach((el) => revealObserver.observe(el));

/* ---------- Cursor spotlight ---------- */
const cursorGlow = document.getElementById("cursorGlow");
if (cursorGlow && window.matchMedia("(hover: hover)").matches) {
  const root = document.documentElement;
  window.addEventListener("mousemove", (e) => {
    root.style.setProperty("--cx", `${e.clientX}px`);
    root.style.setProperty("--cy", `${e.clientY}px`);
    cursorGlow.classList.add("active");
  });
  window.addEventListener("mouseleave", () => cursorGlow.classList.remove("active"));
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-item__q");
  const a = item.querySelector(".faq-item__a");
  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      openItem.classList.remove("open");
      openItem.querySelector(".faq-item__a").style.maxHeight = null;
      openItem.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
      q.setAttribute("aria-expanded", "true");
    }
  });
});

/* ---------- Back to top ---------- */
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
}

/* ---------- Stat count-up ---------- */
const statNums = document.querySelectorAll(".stat-block__num[data-count]");
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) {
    el.textContent = prefix + target.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    return;
  }
  const duration = 1300;
  const start = performance.now();
  function frame(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = target * eased;
    el.textContent = prefix + value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
statNums.forEach((el) => statObserver.observe(el));

/* ---------- Toast notifications ---------- */
const toastStack = document.getElementById("toastStack");
function showToast(message, variant = "") {
  const toast = document.createElement("div");
  toast.className = `toast${variant ? " toast--" + variant : ""}`;
  toast.textContent = message;
  toastStack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ---------- Nav: mobile menu + active link on scroll ---------- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

const navSections = ["dashboard", "how", "strategies", "stats", "analytics", "testimonials", "faq"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navAnchorLinks = document.querySelectorAll('.nav__link[href^="#"]');
window.addEventListener("scroll", () => {
  let current = navSections[0] ? navSections[0].id : "";
  navSections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 140) current = section.id;
  });
  navAnchorLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });

/* ---------- Connect Wallet / API modal ---------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const connectBtn = document.getElementById("connectBtn");
const connectBtnLabel = document.getElementById("connectBtnLabel");
const apiKeysLink = document.getElementById("apiKeysLink");
const modalWalletBtn = document.getElementById("modalWalletBtn");
const apiKeyInput = document.getElementById("apiKeyInput");
const apiKeySubmit = document.getElementById("apiKeySubmit");

let modalTrigger = null;
function openModal(e) {
  modalTrigger = e && e.currentTarget ? e.currentTarget : document.activeElement;
  modalOverlay.classList.add("open");
  modalWalletBtn.focus();
}
function closeModal() {
  modalOverlay.classList.remove("open");
  if (modalTrigger) modalTrigger.focus();
}

connectBtn.addEventListener("click", openModal);
const heroCta = document.getElementById("heroCta");
if (heroCta) heroCta.addEventListener("click", openModal);
apiKeysLink.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function markConnected(label) {
  connectBtn.classList.add("is-connected");
  connectBtnLabel.textContent = label;
  closeModal();
}
modalWalletBtn.addEventListener("click", () => {
  showToast("Кошелёк подключён", "success");
  markConnected("Wallet Connected");
});
apiKeySubmit.addEventListener("click", () => {
  if (!apiKeyInput.value.trim()) {
    showToast("Введите API-ключ", "danger");
    return;
  }
  showToast("API-ключ сохранён", "success");
  markConnected("API Connected");
  apiKeyInput.value = "";
});

/* ---------- Live-feeling price ticker ---------- */
const priceNum = document.getElementById("priceNum");
const priceDelta = document.getElementById("priceDelta");
let refPrice = 3412.84;
let price = refPrice;

function renderPrice() {
  priceNum.textContent = "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = ((price - refPrice) / refPrice) * 100 + 2.4;
  const up = pct >= 0;
  priceDelta.textContent = `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}% за 24ч`;
  priceDelta.classList.toggle("price__delta--up", up);
  priceDelta.classList.toggle("price__delta--down", !up);
}
if (!reduceMotion) {
  setInterval(() => {
    price += (Math.random() - 0.48) * 6;
    renderPrice();
  }, 2400);
}

/* ---------- Terminal activity log (filterable) ---------- */
const LOG_LINES = [
  { cat: "signal", html: '<span class="tag">&gt;</span> сигнал: RSI-дивергенция ETH/USDT' },
  { cat: "trade", html: '<span class="tag">&gt;</span> открыта позиция <span class="up">LONG</span> 0.42 ETH @ 3,412.10' },
  { cat: "trade", html: '<span class="tag">&gt;</span> стоп-лосс установлен: 3,290.00' },
  { cat: "trade", html: '<span class="tag">&gt;</span> позиция закрыта: <span class="up">+2.4%</span>' },
  { cat: "signal", html: '<span class="tag">&gt;</span> сигнал: пробой сопротивления BTC/USDT' },
  { cat: "trade", html: '<span class="tag">&gt;</span> открыта позиция <span class="down">SHORT</span> 0.8 BTC @ 61,204.00' },
  { cat: "trade", html: '<span class="tag">&gt;</span> тейк-профит достигнут: <span class="up">+1.1%</span>' },
  { cat: "signal", html: '<span class="tag">&gt;</span> риск-лимит: объём позиции снижен до 2%' },
  { cat: "error", html: '<span class="tag">&gt;</span> <span class="err">ошибка</span>: таймаут ответа биржи, повтор запроса' },
  { cat: "error", html: '<span class="tag">&gt;</span> <span class="err">предупреждение</span>: проскальзывание выше нормы на SOL/USDT' },
];

const logEl = document.getElementById("terminalLog");
const logFilters = document.getElementById("logFilters");
const logClearBtn = document.getElementById("logClear");
const MAX_LINES = 6;
let logIndex = 0;

function pushLogLine() {
  const entry = LOG_LINES[logIndex % LOG_LINES.length];
  logIndex++;
  const line = document.createElement("div");
  line.className = "log-line";
  line.dataset.cat = entry.cat;
  line.innerHTML = entry.html;
  logEl.appendChild(line);
  while (logEl.children.length > MAX_LINES) {
    logEl.removeChild(logEl.firstElementChild);
  }
}
for (let i = 0; i < 4; i++) pushLogLine();
if (!reduceMotion) setInterval(pushLogLine, 2800);

logFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".log-filter");
  if (!btn) return;
  logFilters.querySelectorAll(".log-filter").forEach((b) => b.classList.toggle("active", b === btn));
  logEl.dataset.filter = btn.dataset.filter;
});
logClearBtn.addEventListener("click", () => {
  logEl.innerHTML = "";
  showToast("Консоль очищена");
});

/* ---------- Timeframe tabs + live chart with hover tooltip ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TF_CONFIG = {
  "5m": { count: 16, unit: "м", step: 5, seed: 11, base: 3390, vol: 9, trend: 0.9 },
  "15m": { count: 16, unit: "м", step: 15, seed: 22, base: 3340, vol: 15, trend: 1.6 },
  "1h": { count: 16, unit: "ч", step: 1, seed: 33, base: 3180, vol: 38, trend: 8.5 },
  "4h": { count: 16, unit: "ч", step: 4, seed: 44, base: 2960, vol: 65, trend: 16 },
  "1D": { count: 16, unit: "д", step: 1, seed: 55, base: 2700, vol: 95, trend: 24 },
};

function buildSeries(cfg) {
  const rand = mulberry32(cfg.seed);
  let p = cfg.base;
  const points = [];
  for (let i = 0; i < cfg.count; i++) {
    p += (rand() - 0.46) * cfg.vol + cfg.trend * 0.15;
    p = Math.max(100, p);
    const stepsAgo = (cfg.count - 1 - i) * cfg.step;
    const label = stepsAgo === 0 ? "сейчас" : `-${stepsAgo}${cfg.unit}`;
    points.push({ price: p, label });
  }
  return points;
}

const chartLine = document.getElementById("chartLine");
const chartArea = document.getElementById("chartArea");
const chartGuide = document.getElementById("chartGuide");
const chartDot = document.getElementById("chartDot");
const chartHit = document.getElementById("chartHit");
const chartSvg = document.getElementById("chartSvg");
const chartTooltip = document.getElementById("chartTooltip");
const chartContainer = document.querySelector(".terminal__chart");
const tfTabs = document.getElementById("tfTabs");

const VB_W = 600, VB_H = 90, PAD = 8;
let currentPoints = [];

function layoutPoints(series) {
  const prices = series.map((s) => s.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const stepX = VB_W / (series.length - 1);
  return series.map((s, i) => ({
    ...s,
    x: i * stepX,
    y: VB_H - PAD - ((s.price - min) / (max - min || 1)) * (VB_H - PAD * 2),
  }));
}

function pathFor(points) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function renderChart(tf, animate) {
  const cfg = TF_CONFIG[tf];
  currentPoints = layoutPoints(buildSeries(cfg));
  const line = pathFor(currentPoints);
  const area = `${line} L${VB_W},${VB_H} L0,${VB_H} Z`;

  const apply = () => {
    chartLine.setAttribute("d", line);
    chartArea.setAttribute("d", area);
  };

  if (animate && !reduceMotion) {
    chartLine.classList.add("chart__fading");
    chartArea.classList.add("chart__fading");
    setTimeout(() => {
      apply();
      chartLine.classList.remove("chart__fading");
      chartArea.classList.remove("chart__fading");
    }, 150);
  } else {
    apply();
  }
}
renderChart("5m", false);

tfTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tf-tab");
  if (!btn) return;
  tfTabs.querySelectorAll(".tf-tab").forEach((b) => b.classList.toggle("active", b === btn));
  renderChart(btn.dataset.tf, true);

  const last = currentPoints[currentPoints.length - 1];
  refPrice = last.price;
  price = last.price;
  renderPrice();

  showToast(`Таймфрейм: ${btn.dataset.tf}`);
});

function nearestPoint(clientX) {
  const rect = chartSvg.getBoundingClientRect();
  const scaleX = VB_W / rect.width;
  const localX = (clientX - rect.left) * scaleX;
  const stepX = VB_W / (currentPoints.length - 1);
  const idx = Math.min(currentPoints.length - 1, Math.max(0, Math.round(localX / stepX)));
  return currentPoints[idx];
}

chartHit.addEventListener("mousemove", (e) => {
  if (!currentPoints.length) return;
  const p = nearestPoint(e.clientX);
  const svgRect = chartSvg.getBoundingClientRect();
  const contRect = chartContainer.getBoundingClientRect();
  const px = (svgRect.left - contRect.left) + (p.x / VB_W) * svgRect.width;
  const py = (svgRect.top - contRect.top) + (p.y / VB_H) * svgRect.height;

  chartGuide.setAttribute("x1", p.x); chartGuide.setAttribute("x2", p.x);
  chartGuide.style.opacity = 1;
  chartDot.setAttribute("cx", p.x); chartDot.setAttribute("cy", p.y);
  chartDot.style.opacity = 1;

  chartTooltip.innerHTML = `<span class="t-price">$${p.price.toFixed(2)}</span><span class="t-time">${p.label}</span>`;
  chartTooltip.style.left = px + "px";
  chartTooltip.style.top = py + "px";
  chartTooltip.classList.add("visible");
});
chartHit.addEventListener("mouseleave", () => {
  chartGuide.style.opacity = 0;
  chartDot.style.opacity = 0;
  chartTooltip.classList.remove("visible");
});

/* ---------- Agent controls: Start / Pause / Stop / Override ---------- */
const btnStart = document.getElementById("btnStart");
const btnPause = document.getElementById("btnPause");
const btnStop = document.getElementById("btnStop");
const btnOverride = document.getElementById("btnOverride");
const liveBadge = document.getElementById("liveBadge");
let agentState = "running";
let overrideOn = false;

function updateAgentUI() {
  btnStart.disabled = agentState === "running";
  btnPause.disabled = agentState !== "running";
  btnStop.disabled = agentState === "stopped";
  btnStart.classList.toggle("is-active", agentState === "running");
  btnPause.classList.toggle("is-active", agentState === "paused");
  liveBadge.textContent = agentState === "running" ? "LIVE" : agentState === "paused" ? "PAUSED" : "STOPPED";
  liveBadge.classList.toggle("is-idle", agentState !== "running");
}
btnStart.addEventListener("click", () => {
  agentState = "running";
  updateAgentUI();
  showToast("Агент запущен", "success");
});
btnPause.addEventListener("click", () => {
  agentState = "paused";
  updateAgentUI();
  showToast("Агент на паузе");
});
btnStop.addEventListener("click", () => {
  agentState = "stopped";
  updateAgentUI();
  showToast("Экстренная остановка. Все позиции закрыты.", "danger");
});
btnOverride.addEventListener("click", () => {
  overrideOn = !overrideOn;
  btnOverride.classList.toggle("is-active", overrideOn);
  showToast(overrideOn ? "Ручное управление включено" : "Ручное управление выключено");
});
updateAgentUI();

/* ---------- Parameter sliders ---------- */
const riskRange = document.getElementById("riskRange");
const ddRange = document.getElementById("ddRange");
const posRange = document.getElementById("posRange");
document.getElementById("riskVal").textContent = riskRange.value + "%";
document.getElementById("ddVal").textContent = ddRange.value + "%";
document.getElementById("posVal").textContent = Number(posRange.value).toLocaleString("en-US") + " USDT";
riskRange.addEventListener("input", () => { document.getElementById("riskVal").textContent = riskRange.value + "%"; });
ddRange.addEventListener("input", () => { document.getElementById("ddVal").textContent = ddRange.value + "%"; });
posRange.addEventListener("input", () => {
  document.getElementById("posVal").textContent = Number(posRange.value).toLocaleString("en-US") + " USDT";
});

/* ---------- Strategy modules ---------- */
const MODULES = {
  analysis: {
    title: "Анализ рынка",
    tag: "Модуль 01",
    params: [
      ["Тикеров под наблюдением", "2 140"],
      ["Частота опроса", "250мс"],
      ["Обнаружено аномалий / 24ч", "37"],
    ],
    logs: [
      "RSI-дивергенция обнаружена: ETH/USDT",
      "Объём вырос на 340% за 5 минут: DOGE/USDT",
      "Корреляция BTC/ETH снизилась до 0.71",
    ],
  },
  execution: {
    title: "Авто-исполнение",
    tag: "Модуль 02",
    params: [
      ["Средняя задержка", "40мс"],
      ["Исполнено сделок / 24ч", "184"],
      ["Проскальзывание (ср.)", "0.03%"],
    ],
    logs: [
      "Открыта позиция LONG 0.42 ETH @ 3,412.10",
      "Закрыта позиция: +2.4%",
      "Ордер исполнен частично, остаток отменён",
    ],
  },
  risk: {
    title: "Управление риском",
    tag: "Модуль 03",
    params: [
      ["Лимит просадки", "12%"],
      ["Макс. объём позиции", "500 USDT"],
      ["Стоп-лоссов сработало / 24ч", "6"],
    ],
    logs: [
      "Стоп-лосс установлен: 3,290.00",
      "Объём позиции снижен до 2% от депозита",
      "Достигнут дневной лимит риска по SOL/USDT",
    ],
  },
  monitor: {
    title: "Мониторинг 24/7",
    tag: "Модуль 04",
    params: [
      ["Аптайм", "99.98%"],
      ["Проверок в секунду", "120"],
      ["Инцидентов / 30д", "1"],
    ],
    logs: [
      "Таймаут ответа биржи, повтор запроса выполнен",
      "Соединение с потоком данных восстановлено",
      "Плановая проверка целостности прошла успешно",
    ],
  },
};

const capsGrid = document.getElementById("capsGrid");
const moduleDetail = document.getElementById("moduleDetail");

function renderModule(key) {
  const m = MODULES[key];
  moduleDetail.innerHTML = `
    <div class="module-detail__head">
      <span class="module-detail__tag">${m.tag}</span>
      <h3>${m.title}</h3>
    </div>
    <div class="module-detail__grid">
      <div class="module-detail__params">
        <span class="module-detail__params-label">Параметры</span>
        ${m.params.map(([k, v]) => `<div class="param-row"><span>${k}</span><strong>${v}</strong></div>`).join("")}
      </div>
      <div class="module-detail__logs">
        <span class="module-detail__logs-label">Последние события</span>
        ${m.logs.map((l) => `<div class="log-line"><span class="tag">&gt;</span> ${l}</div>`).join("")}
      </div>
    </div>
  `;
}
capsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".cap");
  if (!card) return;
  capsGrid.querySelectorAll(".cap").forEach((c) => c.classList.toggle("active", c === card));
  renderModule(card.dataset.module);
});
renderModule("analysis");

/* ---------- Reactive wave-line grid behind the hero ---------- */
(function initWaves() {
  const container = document.getElementById("wavesBg");
  if (!container || reduceMotion) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("waves-svg");
  container.appendChild(svg);

  const dot = document.createElement("div");
  dot.className = "waves-dot";
  container.appendChild(dot);

  let bounding = null;
  let lines = [];
  let paths = [];
  const mouse = { x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false };

  function noise2D(x, y) {
    return (
      Math.sin(x * 1.0 + y * 0.6) * 0.5 +
      Math.sin(x * 0.37 - y * 0.42 + 1.7) * 0.3 +
      Math.sin(x * 0.13 + y * 0.21 + 4.1) * 0.2
    );
  }

  function setSize() {
    bounding = container.getBoundingClientRect();
    svg.style.width = bounding.width + "px";
    svg.style.height = bounding.height + "px";
  }

  function setLines() {
    if (!bounding) return;
    const { width, height } = bounding;
    lines = [];
    paths.forEach((p) => p.remove());
    paths = [];

    const xGap = 20;
    const yGap = 20;
    const oWidth = width + 200;
    const oHeight = height + 30;
    const totalLines = Math.ceil(oWidth / xGap);
    const totalPoints = Math.ceil(oHeight / yGap);
    const xStart = (width - xGap * totalLines) / 2;
    const yStart = (height - yGap * totalPoints) / 2;

    for (let i = 0; i < totalLines; i++) {
      const points = [];
      for (let j = 0; j < totalPoints; j++) {
        points.push({ x: xStart + xGap * i, y: yStart + yGap * j, wx: 0, wy: 0, cx: 0, cy: 0, vx: 0, vy: 0 });
      }
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(167,139,250,0.35)");
      path.setAttribute("stroke-width", "1");
      svg.appendChild(path);
      paths.push(path);
      lines.push(points);
    }
  }

  function updateMouse(x, y) {
    if (!bounding) return;
    mouse.x = x - bounding.left;
    mouse.y = y - bounding.top;
    if (!mouse.set) {
      mouse.sx = mouse.x; mouse.sy = mouse.y; mouse.lx = mouse.x; mouse.ly = mouse.y;
      mouse.set = true;
    }
  }

  function onMouseMove(e) { updateMouse(e.clientX, e.clientY); }
  function onTouchMove(e) { const t = e.touches[0]; if (t) updateMouse(t.clientX, t.clientY); }
  function onResize() { setSize(); setLines(); }

  function movePoints(time) {
    lines.forEach((points) => {
      points.forEach((p) => {
        const move = noise2D((p.x + time * 0.008) * 0.003, (p.y + time * 0.003) * 0.002) * 8;
        p.wx = Math.cos(move) * 12;
        p.wy = Math.sin(move) * 6;

        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);

        if (d < l) {
          const s = 1 - d / l;
          const f = Math.cos(d * 0.001) * s;
          p.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035;
          p.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035;
        }

        p.vx += (0 - p.cx) * 0.01;
        p.vy += (0 - p.cy) * 0.01;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.cx += p.vx;
        p.cy += p.vy;
        p.cx = Math.min(50, Math.max(-50, p.cx));
        p.cy = Math.min(50, Math.max(-50, p.cy));
      });
    });
  }

  function moved(p, withCursor) {
    return { x: p.x + p.wx + (withCursor ? p.cx : 0), y: p.y + p.wy + (withCursor ? p.cy : 0) };
  }

  function drawLines() {
    lines.forEach((points, li) => {
      if (points.length < 2 || !paths[li]) return;
      const first = moved(points[0], false);
      let d = `M ${first.x} ${first.y}`;
      for (let i = 1; i < points.length; i++) {
        const c = moved(points[i], true);
        d += `L ${c.x} ${c.y}`;
      }
      paths[li].setAttribute("d", d);
    });
  }

  function tick(time) {
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx, dy);
    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);
    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    dot.style.transform = `translate3d(${mouse.sx - 2.5}px, ${mouse.sy - 2.5}px, 0)`;

    movePoints(time);
    drawLines();
    requestAnimationFrame(tick);
  }

  setSize();
  setLines();
  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);
  container.addEventListener("touchmove", onTouchMove, { passive: false });
  requestAnimationFrame(tick);
})();
