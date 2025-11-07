// charts.js — initialize charts but animate them only when they scroll into view
// Requires Chart.js and chartjs-plugin-datalabels already loaded on the page.

// ---------- shared options ----------
const sharedPlugins = {
  legend: { position: 'bottom', labels: { padding: 15 } },
  tooltip: {
    displayColors: false,
    callbacks: {
      title: () => null,
      label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
    }
  },
  datalabels: {
    color: "#ffffff",
    font: { weight: "bold", size: 12 },
    formatter: (v) => v + "%"
  }
};

const animatedOptions = {
  animateScale: true,
  animateRotate: true,
  duration: 1200,
  easing: 'easeOutCubic'
};

// Base options used when chart is animated (merged later)
const baseAnimatedConfig = {
  maintainAspectRatio: false,
  responsive: true,
  aspectRatio: 1,
  layout: { padding: 20 },
  animation: animatedOptions,
  plugins: sharedPlugins
};

// Base "paused" options used when chart is created but should not animate yet
const basePausedConfig = {
  maintainAspectRatio: false,
  responsive: true,
  aspectRatio: 1,
  layout: { padding: 20 },
  animation: { duration: 0 }, // no animation initially
  plugins: sharedPlugins
};

// Helper to safely get canvas by id
function $(id) {
  return document.getElementById(id) || null;
}

// Build chart factory that creates a chart but doesn't animate it yet
function createPausedChart(canvasEl, config) {
  if (!canvasEl) return null;
  // merge paused animation into provided config
  const cfg = Object.assign({}, config, { options: Object.assign({}, basePausedConfig, config.options || {}) });
  return new Chart(canvasEl, cfg);
}

// Play entrance animation for a chart once (reset -> set animated options -> update)
function playEntranceAnimation(chart, extraOptions = {}) {
  if (!chart || chart._playedEntrance) return;
  // mark so we don't replay
  chart._playedEntrance = true;

  // Reset to initial state
  try { chart.reset(); } catch (e) { /* ignore if not supported */ }

  // Replace options.animation with animated options
  chart.options.animation = Object.assign({}, animatedOptions, extraOptions);

  // If legend was shrinking pie (long labels), ensure legend not reserving extra space if needed
  if (chart.options.plugins && chart.options.plugins.legend) {
    chart.options.plugins.legend.fullSize = chart.options.plugins.legend.fullSize ?? true;
  }

  // Update to run the animation
  chart.update();
}

// --- Define data/configs for each chart ---
const reasonData = {
  labels: [
    "Donne des conseils",
    "Toujours disponible",
    "Ne me juge pas",
    "Je peux lui dire des choses que je ne dirais pas aux autres",
    "Plus facile que parler à des vraies personnes"
  ],
  datasets: [{
    data: [25.7, 24.3, 20.0, 17.1, 12.9],
    backgroundColor: ["#6A4C93", "#1B998B", "#FF69B4", "#264653", "#F08A5D"],
    hoverOffset: 12
  }]
};

const comfortData = {
  labels: ["A l'aise", "Peu a l'aise", "Pas a l'aise"],
  datasets: [{
    data: [34, 36, 30],
    backgroundColor: ["#7BC67E", "#F6C04D", "#E66B6B"],
    hoverOffset: 12
  }]
};

const smallColors = ["#7BC67E", "#F6C04D", "#E66B6B"];

// paused configs
const reasonConfig = {
  type: 'pie',
  plugins: [ChartDataLabels],
  data: reasonData,
  options: Object.assign({}, basePausedConfig, {
    plugins: Object.assign({}, sharedPlugins, {
      legend: { position: 'bottom', labels: { padding: 15 }, fullSize: false }
    })
  })
};

const comfortConfig = {
  type: 'pie',
  plugins: [ChartDataLabels],
  data: comfortData,
  options: basePausedConfig
};

// small chart factory config builder
function smallChartConfig(values) {
  return {
    type: 'pie',
    plugins: [ChartDataLabels],
    data: {
      labels: ["A l'aise", "Peu a l'aise", "Pas a l'aise"],
      datasets: [{ data: values, backgroundColor: smallColors, hoverOffset: 12 }]
    },
    options: Object.assign({}, basePausedConfig, { plugins: Object.assign({}, sharedPlugins, { legend: { display: false } }) })
  };
}

// --- Create paused charts (safe if canvas exists). They will render immediately WITH NO ANIMATION. ---
const chartInstances = []; // keep refs for observer

const reasonCanvas = $('reasonChart');
if (reasonCanvas) {
  const c = createPausedChart(reasonCanvas, reasonConfig);
  if (c) chartInstances.push({ el: reasonCanvas, chart: c });
}

const comfortCanvas = $('overallComfortChart');
if (comfortCanvas) {
  const c = createPausedChart(comfortCanvas, comfortConfig);
  if (c) chartInstances.push({ el: comfortCanvas, chart: c });
}

// small charts ids and values
const smallCharts = [
  { id: 'friendChart', data: [48, 37, 15] },
  { id: 'parentChart', data: [52, 31, 16] },
  { id: 'therapistChart', data: [30, 38, 31] },
  { id: 'teacherChart', data: [12, 34, 54] },
  { id: 'familyChart', data: [26, 41, 33] }
];

smallCharts.forEach(sc => {
  const el = $(sc.id);
  if (!el) return;
  const cfg = smallChartConfig(sc.data);
  const inst = createPausedChart(el, cfg);
  if (inst) chartInstances.push({ el: el, chart: inst });
});

// --- IntersectionObserver to animate charts as they scroll into view ---
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.35 // 35% visible
};

const chartObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // find matching chartInstance
      const found = chartInstances.find(ci => ci.el === entry.target || ci.el === entry.target.querySelector('canvas'));
      if (found && found.chart) {
        playEntranceAnimation(found.chart);
        obs.unobserve(entry.target);
      } else {
        // if entry.target is the canvas itself (some HTML variants), try to match
        const canvasMatch = chartInstances.find(ci => ci.el === entry.target);
        if (canvasMatch && canvasMatch.chart) {
          playEntranceAnimation(canvasMatch.chart);
          obs.unobserve(entry.target);
        }
      }
    }
  });
}, observerOptions);

// observe the DOM elements — observe wrappers where possible, otherwise canvas
chartInstances.forEach(ci => {
  const wrap = ci.el.closest('.chart-large') || ci.el.closest('.chart-small') || ci.el;
  if (wrap) chartObserver.observe(wrap);
  else chartObserver.observe(ci.el);
});

// Safety: if user quickly loads and charts are already visible, trigger animations now
window.addEventListener('load', () => {
  chartInstances.forEach(ci => {
    const rect = ci.el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      playEntranceAnimation(ci.chart);
      chartObserver.unobserve(ci.el);
    }
  });
});
