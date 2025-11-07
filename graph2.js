gsap.registerPlugin(ScrollTrigger);

const SHEET_ID = "1SGL8xBKHWiE_F8dPr1hpfjomSr3lAJB8UVuO12QtF-c";
const API_KEY = "AIzaSyA8rnzYeqjne94PelVmOIIFr7FlnarJEEk";

const RANGE_LABELS = "Rawdata!AX2:AX201";
const RANGE_NEG    = "Rawdata!AY2:AY201";
const RANGE_POS    = "Rawdata!AZ2:AZ201";

async function fetchColumn(range) {
  const [sheetName, sheetRange] = range.split("!");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}!${sheetRange}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.values) return [];
    return data.values.map(row => row[0]);
  } catch (err) {
    console.error("Fehler beim Abrufen:", range, err);
    return [];
  }
}

function parseNumber(str) {
  if (!str) return 0;
  return Number(str.replace(",", ".")) || 0;
}

let chart;

async function loadDataAndCreateChart() {
  const labels = (await fetchColumn(RANGE_LABELS)).map(v => v || "");
  const neg    = (await fetchColumn(RANGE_NEG)).map(parseNumber);
  const pos    = (await fetchColumn(RANGE_POS)).map(parseNumber);

  if (!labels.length || !neg.length || !pos.length) {
    console.warn("Daten unvollständig – Dummy-Daten werden verwendet.");
    createChart(["A", "B", "C"], [0.2, 0.5, 0.7], [0.3, 0.6, 0.8]);
  } else {
    createChart(labels, pos, neg);
  }
}

function createChart(labels, posData, negData) {
  const ctx = document.getElementById('emotionChart').getContext('2d');

  // Werte: X = TimeSpentSM, Y = Emotionen (%)
  const posBubbles = posData.map((v, i) => ({
    x: parseNumber(labels[i]),
    y: v,
    r: 30 //size of bubbles
  }));

  const negBubbles = negData.map((v, i) => ({
    x: parseNumber(labels[i]),
    y: v,
    r: 30 //size of bubbles
  }));

  chart = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [
        {
          label: "Positive Emotions %",
          data: posBubbles,
          backgroundColor: "rgba(70,100,200,0.5)",
          borderColor: "rgba(70,100,200,1)",
          hidden: false
        },
        {
          label: "Negative Emotions %",
          data: negBubbles,
          backgroundColor: "rgba(200,70,70,0.5)",
          borderColor: "rgba(200,70,70,1)",
          hidden: false
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return `${ctx.dataset.label}: ${ctx.raw.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time Spent on Social Media (min)' },
          // Dynamisch: Minimum & Maximum automatisch bestimmen
          type: 'linear',
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value.toFixed(0);
            }
          }
        },
        y: {
          title: { display: true, text: 'Emotions (%)' },
          min: -100,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      }
    }
  });

  setupToggles();

  if (labels.length > 3) {
    animateScroll(chart);
  }
}


// Scroll-Effekt
function animateScroll(chart) {
  const totalPoints = chart.data.datasets[0].data.length;

  gsap.fromTo(
    { progress: 0 },
    {
      progress: totalPoints,
      scrollTrigger: {
        trigger: "#chartWrapper",
        start: "top 80%",
        end: "bottom 20%",
        scrub: true
      },
      onUpdate: function() {
        const p = Math.floor(this.targets()[0].progress);
        chart.data.datasets.forEach(dataset => {
          dataset.data = dataset.data.map((point, i) =>
            i < p ? point : { ...point, r: 0 }
          );
        });
        chart.update('none');
      }
    }
  );
}

function setupToggles() {
  const togglePos = document.getElementById("togglePos");
  const toggleNeg = document.getElementById("toggleNeg");

  togglePos.addEventListener("change", () => {
    chart.data.datasets[1].hidden = !togglePos.checked;
    chart.update();
  });

  toggleNeg.addEventListener("change", () => {
    chart.data.datasets[0].hidden = !toggleNeg.checked;
    chart.update();
  });
}

loadDataAndCreateChart();
