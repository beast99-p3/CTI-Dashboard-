// This file contains the JavaScript logic for the frontend of the CTI Dashboard application.

// Global variable to store fetched CTI data
let allCtiData = [];

// Function to fetch data from the /cti-data backend endpoint
async function fetchData(ipAddress = null) {
    let url = '/cti-data';
    if (ipAddress) {
        url += `?ip=${encodeURIComponent(ipAddress)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `Network response was not ok (status: ${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (e) {
            }
            throw new Error(errorMsg);
        }
        allCtiData = await response.json();
        if (!Array.isArray(allCtiData)) {
            console.warn("Received non-array data, wrapping in array:", allCtiData);
            allCtiData = allCtiData ? [allCtiData] : [];
        }
        renderTable(allCtiData);
        renderChart(allCtiData);
    } catch (error) {
        console.error('Error fetching data:', error);
        const tableBody = document.getElementById('cti-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Failed to load CTI data: ${error.message}</td></tr>`;
        }
        renderChart([]);
    }
}

// Function to render the data table
function renderTable(dataToRender) {
    const tableBody = document.getElementById('cti-table-body');
    tableBody.innerHTML = '';

    if (!dataToRender || dataToRender.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No data to display.</td></tr>';
        return;
    }

    dataToRender.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.indicator_value || 'N/A'}</td>
            <td>${item.source || 'N/A'}</td>
            <td>${item.abuse_confidence_score !== null && item.abuse_confidence_score !== undefined ? item.abuse_confidence_score : 'N/A'}</td>
            <td>${item.isp || 'N/A'}</td>
            <td>${item.country_code || 'N/A'}</td>
            <td>${item.total_reports !== null && item.total_reports !== undefined ? item.total_reports : 'N/A'}</td>
            <td>${item.last_reported_at ? new Date(item.last_reported_at).toLocaleDateString() : 'N/A'}</td>
            <td><a href="${item.link_to_source || '#'}" target="_blank" ${!(item.link_to_source) ? 'style="pointer-events:none; color:grey;"' : ''}>Details</a></td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to render the chart
function renderChart(dataForChart) {
    const ctx = document.getElementById('ctiChart').getContext('2d');
    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    if (!dataForChart || dataForChart.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText('No data to display in chart.', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const scoreCounts = { low: 0, medium: 0, high: 0, unknown: 0 };

    dataForChart.forEach(item => {
        const score = item.abuse_confidence_score;
        if (score === null || score === undefined) {
            scoreCounts.unknown++;
        } else if (score >= 0 && score <= 40) {
            scoreCounts.low++;
        } else if (score >= 41 && score <= 79) {
            scoreCounts.medium++;
        } else if (score >= 80 && score <= 100) {
            scoreCounts.high++;
        } else {
            scoreCounts.unknown++;
        }
    });

    const labels = ['Low (0-40)', 'Medium (41-79)', 'High (80-100)', 'Unknown'];
    const data = [scoreCounts.low, scoreCounts.medium, scoreCounts.high, scoreCounts.unknown];
    const backgroundColors = [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(153, 102, 255, 0.6)'
    ];
    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)'
    ];

    window.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Abuse Confidence Score Distribution',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#e0e0e0' },
                    grid: { color: '#4f4f7a' }
                },
                x: {
                    ticks: { color: '#e0e0e0' },
                    grid: { color: '#4f4f7a' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: '#e0e0e0' }
                },
                title: {
                    display: true,
                    text: 'Abuse Confidence Score Distribution',
                    color: '#e0e0e0'
                }
            }
        }
    });
}

// Function to apply filters based on user input
function applyFilters() {
    const ipFilterValue = document.getElementById('ip-filter').value.toLowerCase();
    const scoreFilterValue = document.getElementById('score-filter').value;

    let filteredData = allCtiData;

    if (ipFilterValue) {
        filteredData = filteredData.filter(item => 
            item.indicator_value && item.indicator_value.toLowerCase().includes(ipFilterValue)
        );
    }

    if (scoreFilterValue !== 'any') {
        filteredData = filteredData.filter(item => {
            const score = item.abuse_confidence_score;
            if (score === null || score === undefined) return false;

            switch (scoreFilterValue) {
                case "low":
                    return score >= 0 && score <= 40;
                case "medium":
                    return score >= 41 && score <= 79;
                case "high":
                    return score >= 80 && score <= 100;
                default:
                    return true;
            }
        });
    }

    renderTable(filteredData);
    renderChart(filteredData);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    const ipFilterInput = document.getElementById('ip-filter');
    const scoreFilterSelect = document.getElementById('score-filter');
    const searchButton = document.getElementById('search-ip-button');

    if (ipFilterInput) {
        ipFilterInput.addEventListener('input', applyFilters);
    }
    if (scoreFilterSelect) {
        scoreFilterSelect.addEventListener('change', applyFilters);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const ipToSearch = ipFilterInput.value.trim();
            if (ipToSearch) {
                fetchData(ipToSearch);
            } else {
                alert("Please enter an IP address to search.");
            }
        });
    }
});