gsap.registerPlugin(ScrollTrigger);

const SHEET_ID_2 = "1SGL8xBKHWiE_F8dPr1hpfjomSr3lAJB8UVuO12QtF-c";
const API_KEY_2  = "AIzaSyA8rnzYeqjne94PelVmOIIFr7FlnarJEEk";

const RANGE_LABELS = "Rawdata!AX2:AX201";
const RANGE_NEG    = "Rawdata!AY2:AY201";
const RANGE_POS    = "Rawdata!AZ2:AZ201";

function parseNumber(str) {
    if (!str) return 0;
    return Number(str.replace(",", ".")) || 0;
}

async function fetchColumn(range) {
    const [sheetName, sheetRange] = range.split("!");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID_2}/values/${encodeURIComponent(sheetName)}!${sheetRange}?key=${API_KEY_2}`;
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

async function loadBubbleChart() {
    const labels = (await fetchColumn(RANGE_LABELS)).map(v => v || "");
    const neg    = (await fetchColumn(RANGE_NEG)).map(parseNumber);
    const pos    = (await fetchColumn(RANGE_POS)).map(parseNumber);

    createBubbleChart(labels, pos, neg);
}

function createBubbleChart(labels, posData, negData) {
    const ctx = document.getElementById('emotionChart').getContext('2d');

    const posBubbles = posData.map((v, i) => ({ x: parseNumber(labels[i]), y: v, r: 30 }));
    const negBubbles = negData.map((v, i) => ({ x: parseNumber(labels[i]), y: v, r: 30 }));

    const emotionChartInstance = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [
                { label: "Positive Emotions %", data: posBubbles, backgroundColor: "rgba(70,100,200,0.5)", borderColor: "rgba(70,100,200,1)" },
                { label: "Negative Emotions %", data: negBubbles, backgroundColor: "rgba(200,70,70,0.5)", borderColor: "rgba(200,70,70,1)" }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.y.toFixed(2)}%` }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Time Spent on Social Media (min)' },
                    type: 'linear',
                    beginAtZero: false,
                    ticks: { callback: (value) => value.toFixed(0) }
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

    if (labels.length > 3) animateScroll(emotionChartInstance);
    const togglePos = document.getElementById("togglePos");
    const toggleNeg = document.getElementById("toggleNeg");

    togglePos.addEventListener("change", () => { emotionChartInstance.data.datasets[0].hidden = !togglePos.checked; emotionChartInstance.update(); });
    toggleNeg.addEventListener("change", () => { emotionChartInstance.data.datasets[1].hidden = !toggleNeg.checked; emotionChartInstance.update(); });
}

function animateScroll(chart) {
    const totalPoints = chart.data.datasets[0].data.length;

    gsap.fromTo({ progress: 0 }, {
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
                dataset.data = dataset.data.map((point, i) => i < p ? point : { ...point, r: 0 });
            });
            chart.update('none');
        }
    });
}

document.addEventListener("DOMContentLoaded", loadBubbleChart);
