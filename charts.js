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

const baseAnimatedConfig = {
  maintainAspectRatio: false,
  responsive: true,
  aspectRatio: 1,
  layout: { padding: 20 },
  animation: animatedOptions,
  plugins: sharedPlugins
};


const basePausedConfig = {
  maintainAspectRatio: false,
  responsive: true,
  aspectRatio: 1,
  layout: { padding: 20 },
  animation: { duration: 0 }, 
  plugins: sharedPlugins
};


function $(id) {
  return document.getElementById(id) || null;
}

function createPausedChart(canvasEl, config) {
  if (!canvasEl) return null;
  
  const cfg = Object.assign({}, config, { options: Object.assign({}, basePausedConfig, config.options || {}) });
  return new Chart(canvasEl, cfg);
}


function playEntranceAnimation(chart, extraOptions = {}) {
  if (!chart || chart._playedEntrance) return;

  chart._playedEntrance = true;


  try { chart.reset(); } catch (e) { /* ignore if not supported */ }


  chart.options.animation = Object.assign({}, animatedOptions, extraOptions);


  if (chart.options.plugins && chart.options.plugins.legend) {
    chart.options.plugins.legend.fullSize = chart.options.plugins.legend.fullSize ?? true;
  }

   chart.update();
}

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


const chartInstances = []; 

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


chartInstances.forEach(ci => {
  const wrap = ci.el.closest('.chart-large') || ci.el.closest('.chart-small') || ci.el;
  if (wrap) chartObserver.observe(wrap);
  else chartObserver.observe(ci.el);
});


window.addEventListener('load', () => {
  chartInstances.forEach(ci => {
    const rect = ci.el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      playEntranceAnimation(ci.chart);
      chartObserver.unobserve(ci.el);
    }
  });
});
