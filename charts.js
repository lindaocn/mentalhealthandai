// Shared pie options
const baseOptions = {
  maintainAspectRatio: false,
  responsive: true,
  aspectRatio: 1,
  layout: { padding: 20 },
  plugins: {
    legend: { position: 'bottom', labels: { padding: 15 } },
    tooltip: {
      displayColors: false,
      callbacks: {
        title: () => null,
        label: (context) => `${context.label}: ${context.parsed}%`
      }
    },
    datalabels: {
      color: "#ffffff",
      font: { weight: "bold", size: 12 },
      formatter: (value) => value + "%"
    }
  },
  animation: { animateScale: true, animateRotate: true, duration: 1200 }
};

// === Chart 1 === (Reason Chart)
new Chart(document.getElementById('reasonChart'), {
  type: 'pie',
  plugins: [ChartDataLabels],
  data: {
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
  },
  options: {
    ...baseOptions,
    plugins: { 
      ...baseOptions.plugins,
      legend: { 
        position: 'bottom', 
        labels: { padding: 15 },
        fullSize: false // ✅ prevents shrinking the pie for long labels
      }
    }
  }
});

// === Chart 2 === (Overall Comfort Chart)
new Chart(document.getElementById('overallComfortChart'), {
  type: 'pie',
  plugins: [ChartDataLabels],
  data: {
    labels: ["A l'aise", "Peu a l'aise", "Pas a l'aise"],
    datasets: [{
      data: [34, 36, 30],
      backgroundColor: ["#7BC67E", "#F6C04D", "#E66B6B"],
      hoverOffset: 12
    }]
  },
  options: baseOptions
});

// Function for small charts
function smallChart(id, values) {
  new Chart(document.getElementById(id), {
    type: 'pie',
    plugins: [ChartDataLabels],
    data: {
      labels: ["A l'aise", "Peu a l'aise", "Pas a l'aise"],
      datasets: [{
        data: values,
        backgroundColor: ["#7BC67E", "#F6C04D", "#E66B6B"],
        hoverOffset: 12
      }]
    },
    options: {
      ...baseOptions,
      plugins: { ...baseOptions.plugins, legend: { display: false } }
    }
  });
}

// Create the 5 mini charts
smallChart("friendChart", [48, 37, 15]);
smallChart("parentChart", [52, 31, 16]);
smallChart("therapistChart", [30, 38, 31]);
smallChart("teacherChart", [12, 34, 54]);
smallChart("familyChart", [26, 41, 33]);
