// --- 1. 数据模拟 ---
const poiData = [
    { name: "Erhai Lake", lat: 25.69, lng: 100.16, cat: "Nature", score: 95 },
    { name: "Dali Old Town", lat: 25.69, lng: 100.14, cat: "Culture", score: 90 },
    { name: "Lijiang Old Town", lat: 26.87, lng: 100.23, cat: "Culture", score: 92 },
    { name: "Jade Dragon Snow Mtn", lat: 27.09, lng: 100.20, cat: "Nature", score: 98 },
    { name: "Tiger Leaping Gorge", lat: 27.21, lng: 100.13, cat: "Nature", score: 88 },
    { name: "Songzanlin Monastery", lat: 27.85, lng: 99.70, cat: "Culture", score: 85 },
    { name: "Yak Hotpot", lat: 27.80, lng: 99.72, cat: "Food", score: 75 },
    { name: "Xizhou Baba", lat: 25.85, lng: 100.13, cat: "Food", score: 80 }
];

// --- 2. 地图初始化 ---
const map = L.map('dash-map').setView([26.5, 100.5], 7);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
let markers = L.layerGroup().addTo(map);

function renderMap(category) {
    markers.clearLayers();
    poiData.forEach(p => {
        if (category === 'all' || p.cat === category) {
            const color = p.cat === 'Nature' ? 'green' : (p.cat === 'Culture' ? 'blue' : 'orange');
            const marker = L.circleMarker([p.lat, p.lng], {
                radius: 8, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.8
            }).bindPopup(`<b>${p.name}</b><br>${p.cat}`);
            markers.addLayer(marker);
        }
    });
}
renderMap('all');

// --- 3. 图表初始化 (Chart.js) ---
const ctxTemp = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(ctxTemp, {
    type: 'line',
    data: {
        labels: ['J','F','M','A','M','J','J','A','S','O','N','D'],
        datasets: [{
            label: 'Avg Temp (°C)', data: [8,10,13,16,19,22,23,22,20,17,12,9],
            borderColor: '#e74c3c', tension: 0.4
        }]
    },
    options: { maintainAspectRatio: false, plugins: { title: { display: true, text: 'Climate Trend' } } }
});

const ctxBudget = document.getElementById('budgetChart').getContext('2d');
const budgetChart = new Chart(ctxBudget, {
    type: 'doughnut',
    data: {
        labels: ['Stay', 'Transport', 'Food', 'Tickets'],
        datasets: [{ data: [40, 30, 20, 10], backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#2ecc71'] }]
    },
    options: { maintainAspectRatio: false, plugins: { title: { display: true, text: 'Est. Budget Breakdown' } } }
});

const ctxPop = document.getElementById('popChart').getContext('2d');
const popChart = new Chart(ctxPop, {
    type: 'bar',
    data: {
        labels: poiData.slice(0, 5).map(p => p.name.substring(0, 10) + '..'),
        datasets: [{ label: 'Popularity Score', data: poiData.slice(0, 5).map(p => p.score), backgroundColor: '#34495e' }]
    },
    options: { maintainAspectRatio: false, indexAxis: 'y', plugins: { title: { display: true, text: 'Top Locations' } } }
});

// --- 4. 交互逻辑 ---
document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
        document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        const cat = e.target.dataset.cat;
        renderMap(cat);
        
        popChart.data.datasets[0].data = cat === 'all' 
            ? poiData.slice(0,5).map(p=>p.score) 
            : poiData.filter(p=>p.cat===cat).map(p=>p.score);
        popChart.update();
    });
});

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
document.getElementById('monthSlider').addEventListener('input', (e) => {
    const mIndex = e.target.value - 1;
    document.getElementById('monthDisplay').innerText = monthNames[mIndex];
    
    const colors = new Array(12).fill('#e74c3c');
    colors[mIndex] = '#000';
    tempChart.data.datasets[0].pointBackgroundColor = colors;
    tempChart.data.datasets[0].pointRadius = colors.map(c => c === '#000' ? 6 : 3);
    tempChart.update();
});