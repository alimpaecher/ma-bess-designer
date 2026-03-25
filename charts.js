// ============================================
// BESS Dashboard — Chart.js Energy Flow Chart
// ============================================

let energyChart = null;

function createOrUpdateChart(results) {
    const ctx = document.getElementById('energyFlowChart').getContext('2d');

    const monthlyLoad = results.monthly.map(m => m.monthlyLoad);
    const monthlySolar = results.monthly.map(m => m.monthlySolar);
    const surplus = results.monthly.map(m => m.surplus);

    const data = {
        labels: MONTHLY_SOLAR.labels,
        datasets: [
            {
                label: 'Monthly Load (kWh)',
                data: monthlyLoad,
                backgroundColor: 'rgba(207, 34, 46, 0.5)',
                borderColor: '#cf222e',
                borderWidth: 1,
                order: 2
            },
            {
                label: 'Solar Production (kWh)',
                data: monthlySolar,
                backgroundColor: 'rgba(179, 89, 0, 0.5)',
                borderColor: '#b35900',
                borderWidth: 1,
                order: 3
            },
            {
                label: 'Surplus / Deficit (kWh)',
                data: surplus,
                type: 'line',
                borderColor: '#0969da',
                backgroundColor: 'rgba(9, 105, 218, 0.05)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: surplus.map(v => v >= 0 ? '#1a7f37' : '#cf222e'),
                fill: true,
                tension: 0.3,
                order: 1
            },
            {
                label: 'Battery Reserve (kWh)',
                data: results.monthly.map(m => m.batteryReserve),
                type: 'line',
                borderColor: '#1a7f37',
                borderWidth: 2,
                borderDash: [6, 3],
                pointRadius: 0,
                fill: false,
                order: 0
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                labels: {
                    color: '#555',
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#222',
                bodyColor: '#555',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + fmt(context.parsed.y) + ' kWh';
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#888' },
                grid: { color: 'rgba(0, 0, 0, 0.06)' }
            },
            y: {
                ticks: {
                    color: '#888',
                    callback: function(value) { return fmt(value) + ' kWh'; }
                },
                grid: { color: 'rgba(0, 0, 0, 0.06)' }
            }
        }
    };

    if (energyChart) {
        energyChart.data = data;
        energyChart.update();
    } else {
        energyChart = new Chart(ctx, { type: 'bar', data, options });
    }
}
