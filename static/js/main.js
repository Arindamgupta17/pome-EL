document.getElementById('predictionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 1. Gather Data
    const formData = {
        JobRole: document.getElementById('JobRole').value,
        Department: document.getElementById('Department').value,
        WorkLifeBalance: document.querySelector('input[name="WorkLifeBalance"]:checked').value,
        JobSatisfaction: document.querySelector('input[name="JobSatisfaction"]:checked').value,
        StockOptionLevel: document.getElementById('StockOptionLevel').value
    };

    // 2. Call API
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.error) {
            alert("Error: " + result.error);
            return;
        }

        // 3. Update UI
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to get prediction');
    }
});

function displayResults(data) {
    // Show Sections
    document.getElementById('resultCard').style.display = 'block';
    document.getElementById('chartsArea').style.display = 'grid';
    document.getElementById('actionCard').style.display = 'block';

    // Risk Badge
    const badge = document.getElementById('riskBadge');
    badge.textContent = `${data.risk_level} Risk`;
    badge.className = `risk-badge badge-${data.risk_level.toLowerCase()}`;

    // Prediction Text
    document.getElementById('predictionText').textContent = data.attrition_prediction === 1 
        ? "High Risk of Attrition" 
        : "Likely to Stay";
    
    // Probability
    document.getElementById('probValue').textContent = `${data.attrition_probability}%`;
    
    // Progress Bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${data.attrition_probability}%`;
    progressBar.style.backgroundColor = getRiskColor(data.risk_level);

    // Insights
    document.getElementById('featureSummary').textContent = data.feature_summary;

    // Charts
    renderContributionChart(data.feature_contributions);
    renderHistoryChart();

    // Recommendations
    renderActionPlan(data.risk_level);
}

function getRiskColor(level) {
    if (level === 'Low') return '#10b981';
    if (level === 'Medium') return '#f59e0b';
    return '#ef4444';
}

function renderActionPlan(riskLevel) {
    const list = document.getElementById('actionList');
    list.innerHTML = '';
    
    const plans = {
        'Low': [
            "Maintain current engagement strategies",
            "Implement peer recognition program",
            "Conduct regular stay interviews"
        ],
        'Medium': [
            "Schedule career development discussion",
            "Review current compensation package",
            "Check in on workload and burnout levels"
        ],
        'High': [
            "IMMEDIATE: Offer retention bonus or stock refresh",
            "Discuss role redesign or internal mobility",
            "Mandatory work-life balance intervention"
        ]
    };

    plans[riskLevel].forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });
}

// Chart Global References
let contribChart = null;
let histChart = null;

function renderContributionChart(contributions) {
    const ctx = document.getElementById('contributionChart').getContext('2d');
    
    if (contribChart) contribChart.destroy();

    contribChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(contributions),
            datasets: [{
                label: 'Impact on Attrition Risk',
                data: Object.values(contributions),
                backgroundColor: Object.values(contributions).map(v => v > 0 ? '#ef4444' : '#10b981')
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

function renderHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    if (histChart) return; // Only render once

    histChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Stayed', 'Left'],
            datasets: [{
                data: [84, 16], // Mock Industry Standard
                backgroundColor: ['#10b981', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Company Average Attrition' }
            }
        }
    });
}

function resetForm() {
    document.getElementById('predictionForm').reset();
    document.getElementById('resultCard').style.display = 'none';
    document.getElementById('chartsArea').style.display = 'none';
    document.getElementById('actionCard').style.display = 'none';
}

// Research Mode Toggle
document.getElementById('researchModeToggle').addEventListener('change', function(e) {
    const details = document.getElementById('researchDetails');
    details.style.display = e.target.checked ? 'block' : 'none';
});
