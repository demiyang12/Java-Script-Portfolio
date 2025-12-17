// 1. 数据配置 (模拟)
// isWishlist: true -> 彩色 (Wishlist), false -> 灰色 (Others)
const poiData = [
    { id: 1, name: "Jade Dragon Snow Mtn", lat: 27.09, lng: 100.20, price: 40, ele: 4600, cat: "Nature", isWishlist: true }, 
    { id: 2, name: "Lijiang Old Town", lat: 26.87, lng: 100.23, price: 12, ele: 2400, cat: "Culture", isWishlist: true },
    { id: 3, name: "Shangri-La", lat: 27.82, lng: 99.70, price: 0, ele: 3160, cat: "Culture", isWishlist: true },
    { id: 4, name: "Shaxi Old Town", lat: 26.32, lng: 99.85, price: 0, ele: 2100, cat: "Culture", isWishlist: false },
    { id: 5, name: "Tiger Leaping Gorge", lat: 27.21, lng: 100.13, price: 15, ele: 1800, cat: "Nature", isWishlist: true },
    { id: 6, name: "Wild Yak Hotpot", lat: 27.80, lng: 99.72, price: 30, ele: 3200, cat: "Food", isWishlist: false },
    { id: 7, name: "Erhai Lake", lat: 25.69, lng: 100.16, price: 0, ele: 1972, cat: "Nature", isWishlist: false }
];

// 2. 初始化地图
const map = L.map('map', { zoomControl: false }).setView([26.8, 100.2], 8);
L.control.zoom({ position: 'topleft' }).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

let routeLayer = L.layerGroup().addTo(map);

// 3. 渲染 Marker (灰 vs 彩)
poiData.forEach(p => {
    let cssClass = 'marker-gray';
    let iconHtml = '<i class="fa-solid fa-location-dot"></i>';
    
    // 如果在 Wishlist 中，给彩色
    if (p.isWishlist) {
        cssClass = `marker-wishlist cat-${p.cat}`; 
        if(p.cat === 'Nature') iconHtml = '<i class="fa-solid fa-mountain"></i>';
        if(p.cat === 'Culture') iconHtml = '<i class="fa-solid fa-landmark"></i>';
        if(p.cat === 'Food') iconHtml = '<i class="fa-solid fa-utensils"></i>';
    }

    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin ${cssClass}">${iconHtml}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });

    const marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);

    const popupHtml = `
        <div style="text-align:center">
            <b>${p.name}</b><br>
            <span style="font-size:12px;color:#666">Ele: ${p.ele}m | Cost: $${p.price}</span><br>
            <button class="popup-btn" onclick="addToPlan(${p.id})">+ Add to Day 1</button>
        </div>
    `;
    marker.bindPopup(popupHtml);
});

// 4. 日期计算逻辑
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const totalDaysDisplay = document.getElementById('totalDaysDisplay');

function updateDays() {
    const d1 = new Date(dateFrom.value);
    const d2 = new Date(dateTo.value);
    
    if(d1 && d2 && d2 >= d1) {
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        totalDaysDisplay.innerText = diffDays + " Days";
    } else {
        totalDaysDisplay.innerText = "--";
    }
}
dateFrom.addEventListener('change', updateDays);
dateTo.addEventListener('change', updateDays);
updateDays(); // Init

// 5. 添加地点逻辑
window.addToPlan = function(id) {
    const p = poiData.find(x => x.id === id);
    if (!p) return;

    const list = document.getElementById('day1'); // 默认加到 Day 1
    // 移除空状态提示
    const empty = list.querySelector('.empty-state');
    if (empty) empty.style.display = 'none';

    const li = document.createElement('li');
    li.className = 'trip-item';
    li.dataset.lat = p.lat;
    li.dataset.lng = p.lng;
    li.dataset.ele = p.ele;
    li.dataset.price = p.price;
    li.dataset.name = p.name;
    
    li.innerHTML = `
        <div class="item-info">
            <span class="item-name">${p.name}</span>
            <span class="item-meta">${p.ele}m</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
            <span class="item-price">$${p.price}</span>
            <i class="fa-solid fa-xmark item-remove" onclick="removePoint(this)"></i>
        </div>
    `;

    list.appendChild(li);
    map.closePopup();
    updateGlobalState(true); // true 代表是新添加的操作
};

window.removePoint = function(el) {
    el.closest('li').remove();
    updateGlobalState(false);
};

// 6. 新增 Add Day 功能
let dayCount = 3;
window.addNewDay = function() {
    dayCount++;
    const container = document.getElementById('daysContainer');
    
    const div = document.createElement('div');
    div.className = 'day-section';
    div.innerHTML = `
        <div class="day-title">DAY ${dayCount}: NEW ADVENTURE</div>
        <ul class="waypoint-list" id="day${dayCount}">
            <li class="empty-state">Drag items here...</li>
        </ul>
    `;
    container.appendChild(div);
    
    // 初始化拖拽
    new Sortable(document.getElementById(`day${dayCount}`), {
        group: 'shared', animation: 150, onEnd: () => updateGlobalState(false)
    });
};

// 7. 拖拽初始化
['day1', 'day2', 'day3'].forEach(id => {
    new Sortable(document.getElementById(id), {
        group: 'shared', animation: 150, onEnd: () => updateGlobalState(false)
    });
});

// 8. 全局状态更新 (Budget & Route & Chart)
function updateGlobalState(isNewAdd) {
    let totalCost = 0;
    let points = [];
    
    // 遍历所有点
    document.querySelectorAll('.trip-item').forEach(item => {
        const price = parseInt(item.dataset.price);
        totalCost += price;
        points.push({
            lat: parseFloat(item.dataset.lat),
            lng: parseFloat(item.dataset.lng),
            ele: parseInt(item.dataset.ele),
            name: item.dataset.name
        });
    });

    // Update Text
    const costEl = document.getElementById('totalCostDisplay');
    costEl.innerText = `$${totalCost}`;
    document.getElementById('totalStopsDisplay').innerText = points.length;

    // ★★★ 预算逻辑 ★★★
    const budgetLimit = parseInt(document.getElementById('budgetInput').value) || 0;
    
    if (totalCost > budgetLimit) {
        costEl.classList.add('over-budget'); // 变红
        // 只有在新增操作导致超支时弹窗，防止拖拽时频繁弹窗
        if (isNewAdd) {
            alert(`⚠️ WARNING: Over Budget!\nCurrent: $${totalCost}\nLimit: $${budgetLimit}`);
        }
    } else {
        costEl.classList.remove('over-budget');
    }

    // Update Map Route
    updateRoute(points);
    
    // Update Chart
    updateChart(points);
}

// 监听预算输入框变化
document.getElementById('budgetInput').addEventListener('input', () => updateGlobalState(false));

function updateRoute(points) {
    routeLayer.clearLayers();
    if(points.length < 2) return;
    const latlngs = points.map(p => [p.lat, p.lng]);
    L.polyline(latlngs, { color: '#4cd137', weight: 4 }).addTo(routeLayer);
}

// Chart
let myChart = null;
function updateChart(points) {
    const ctx = document.getElementById('elevationChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    const labels = points.map(p => p.name);
    const data = points.map(p => p.ele);
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Elevation (m)', data: data,
                borderColor: '#4cd137', backgroundColor: 'rgba(76, 209, 55, 0.2)',
                fill: true, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: false },
            scales: { x: { display: false }, y: { display: true } }
        }
    });
}