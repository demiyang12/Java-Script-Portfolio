// 1. 数据源：增加了 elevation (海拔) 模拟数据
const locations = [
    { id: 1, name: "Dali Ancient City", price: 0, ele: 1975, coords: [25.69, 100.16] },
    { id: 2, name: "Three Pagodas", price: 18, ele: 2000, coords: [25.71, 100.14] },
    { id: 3, name: "Erhai Lake", price: 25, ele: 1972, coords: [25.75, 100.20] },
    { id: 4, name: "Shaxi Old Town", price: 0, ele: 2100, coords: [26.32, 99.85] },
    { id: 5, name: "Lijiang Old Town", price: 12, ele: 2400, coords: [26.87, 100.23] },
    { id: 6, name: "Blue Moon Valley", price: 10, ele: 2800, coords: [27.11, 100.22] },
    { id: 7, name: "Jade Dragon Snow Mtn", price: 40, ele: 4506, coords: [27.09, 100.20] },
    { id: 8, name: "Tiger Leaping Gorge", price: 15, ele: 1800, coords: [27.21, 100.13] },
    { id: 9, name: "Shangri-La", price: 0, ele: 3160, coords: [27.82, 99.70] }
];

// 2. 初始化地图 (Komoot 风格底图通常比较干净)
const map = L.map('map', { zoomControl: false }).setView([26.8, 100.2], 8);
L.control.zoom({ position: 'topright' }).addTo(map);

// 使用 CartoDB Voyager (更像 Komoot 的明亮风格)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

// 3. 变量存储
let routeLayer = L.layerGroup().addTo(map);
let addedPoints = []; // 存储已添加到行程的点对象
let focusMarker = null; // 用于图表联动的高亮光标

// 4. 渲染地图 Marker
locations.forEach(loc => {
    const marker = L.marker(loc.coords).addTo(map);
    
    // 自定义 Popup
    const popupContent = `
        <div style="font-family:sans-serif;">
            <h3 style="margin:0 0 5px 0;">${loc.name}</h3>
            <div style="color:#666; font-size:12px; margin-bottom:5px;">
                Elevation: ${loc.ele}m <br> Cost: $${loc.price}
            </div>
            <button class="popup-btn" onclick="addPoint(${loc.id})">
                Add to Tour
            </button>
        </div>
    `;
    marker.bindPopup(popupContent);
});

// 5. 核心逻辑：添加点到侧边栏
window.addPoint = function(id) {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;

    // 添加到数据数组
    addedPoints.push(loc);

    // 渲染 UI 列表
    const li = document.createElement('li');
    li.className = 'trip-item';
    li.setAttribute('data-id', loc.id);
    li.innerHTML = `
        <span class="item-name">${loc.name}</span>
        <span class="item-tag">${loc.ele}m</span>
    `;
    
    // 简单的逻辑：前3个点去 Day 1，后面去 Day 2 (仅作演示)
    const targetList = addedPoints.length <= 3 ? document.getElementById('day1') : document.getElementById('day2');
    
    // 移除 empty state
    const emptyState = targetList.querySelector('.empty-state');
    if(emptyState) emptyState.style.display = 'none';
    
    targetList.appendChild(li);

    map.closePopup();
    updateApp();
};

// 6. 更新应用状态 (路线、统计、图表)
function updateApp() {
    updateRoute();
    updateStats();
    updateChart();
}

function updateRoute() {
    routeLayer.clearLayers();
    if (addedPoints.length < 2) return;

    const latlngs = addedPoints.map(p => p.coords);
    
    // 画线 (模拟 Komoot 的路径样式)
    L.polyline(latlngs, {
        color: '#4cd137', // Komoot Green
        weight: 5,
        opacity: 0.8,
        lineJoin: 'round'
    }).addTo(routeLayer);

    // 调整视野
    map.fitBounds(L.latLngBounds(latlngs), { padding: [100, 100] });
}

function updateStats() {
    const totalCost = addedPoints.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('totalCost').innerText = `$${totalCost}`;
    document.getElementById('totalStops').innerText = addedPoints.length;
}

// 7. 图表与联动 (Komoot 的灵魂)
let elevationChart = null;

function updateChart() {
    const ctx = document.getElementById('elevationChart').getContext('2d');
    
    // 准备数据
    const labels = addedPoints.map((p, i) => `Stop ${i+1}`);
    const dataElev = addedPoints.map(p => p.ele);

    if (elevationChart) elevationChart.destroy();

    elevationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Elevation (m)',
                data: dataElev,
                borderColor: '#4cd137',
                backgroundColor: 'rgba(76, 209, 55, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: { enabled: true },
                legend: { display: false }
            },
            scales: {
                y: { display: true, beginAtZero: false },
                x: { display: false } // 隐藏 X 轴标签以保持简洁
            },
            // --- 关键交互：鼠标在图表上移动 ---
            onHover: (event, elements) => {
                if (elements && elements.length > 0) {
                    const index = elements[0].index;
                    const point = addedPoints[index];
                    highlightOnMap(point.coords);
                } else {
                    removeHighlight();
                }
            }
        }
    });
}

// 8. 图表 -> 地图 联动实现
function highlightOnMap(coords) {
    if (focusMarker) {
        focusMarker.setLatLng(coords);
    } else {
        // 创建一个蓝色的光晕 Marker
        const icon = L.divIcon({
            className: 'focus-icon',
            html: '<div style="width:16px;height:16px;background:#2980b9;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });
        focusMarker = L.marker(coords, { icon: icon, zIndexOffset: 1000 }).addTo(map);
    }
}

function removeHighlight() {
    if (focusMarker) {
        map.removeLayer(focusMarker);
        focusMarker = null;
    }
}

// 9. 拖拽排序初始化
['day1', 'day2'].forEach(id => {
    new Sortable(document.getElementById(id), {
        group: 'shared',
        animation: 150,
        onEnd: () => {
            // 这里需要复杂的逻辑重组 addedPoints 数组
            // 为简化演示，这里仅提示。在真实项目中，需要根据 DOM 顺序重新 map 数据。
            console.log("Reordering logic needs to be implemented based on DOM");
        }
    });
});