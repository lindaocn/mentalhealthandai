const SHEET_ID_1 = "1opcNxOu2B2L4TdMgnpHFetw_lKRrYUM3BrX8WkRxp5o";
const API_KEY_1  = "AIzaSyA8rnzYeqjne94PelVmOIIFr7FlnarJEEk";

const RANGE_DISTRESS = "Rawdata!G16";
const RANGE_WELLBEING = "Rawdata!G26";

async function fetchCell(range, sheetId = SHEET_ID_1) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${API_KEY_1}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.values) return 0;

        let value = data.values[0][0].toString()
            .replace(",", ".")
            .replace("%", "")
            .trim();
        return Number(value) || 0;
    } catch (err) {
        console.error("Fetch error:", err);
        return 0;
    }
}

async function loadBarChart() {
    const distress = await fetchCell(RANGE_DISTRESS);
    const wellbeing = await fetchCell(RANGE_WELLBEING);

    const ctx = document.getElementById("barChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Bien-être psychologique", "Détresse psychologique"],
            datasets: [{
                label: "Score (%)",
                data: [wellbeing, distress],
                backgroundColor: ["#55a3c7", "#d65a5a"],
                borderColor: ["#1f6d88", "#943131"],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: { 
                        callback: (value) => value + "%",
                        color: "#333",
                        font: {
                            family: "Inter-Medium",
                            size: 16
                        }
                    },
                    title: { 
                        display: true, 
                        text: "Pourcent (%)",
                        color: "#000",
                        font: {
                            family: "Inter-Medium",
                            size: 20,
                            weight: "500"
                        }
                    },
                    grid: { color: "rgba(0,0,0,0.1)" }
                },
                y: {
                    title: { 
                        display: true, 
                        text: "Catégorie",
                        color: "#000",
                        font: {
                            family: "Inter-Medium",
                            size: 20,
                            weight: "500"
                        }
                    },
                    ticks: {
                        color: "#333",
                        font: {
                            family: "Inter-Medium",
                            size: 16
                        }
                    },
                    grid: { color: "rgba(0,0,0,0.1)" }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { 
                    callbacks: { 
                        label: (ctx) => `${ctx.raw.toFixed(1)}%` 
                    },
                    titleFont: {
                        family: "Inter-Medium",
                        size: 16
                    },
                    bodyFont: {
                        family: "Inter-Medium",
                        size: 14
                    }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", loadBarChart);
