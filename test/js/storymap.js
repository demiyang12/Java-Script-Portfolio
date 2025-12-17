// storymap.js

// 1. 生成蜿蜒的茶马古道路线数据
// 为了让线看起来“蜿蜒曲折”，我们在主要点之间插入了模拟的贝塞尔曲线点
function generateCurvedPath(start, end, bendFactor = 0.2) {
    const points = [];
    const steps = 10;
    // 简单的二次贝塞尔曲线模拟
    // 找一个控制点，稍微偏离直线
    const midLat = (start[0] + end[0]) / 2 + (Math.random() - 0.5) * bendFactor;
    const midLng = (start[1] + end[1]) / 2 + (Math.random() - 0.5) * bendFactor;
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midLat + t * t * end[0];
        const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midLng + t * t * end[1];
        points.push([lat, lng]);
    }
    return points;
}

// 定义主要站点 (真实坐标)
const keyLocations = {
    puer: [22.785, 100.97],
    dali: [25.69, 100.16],
    lijiang: [26.87, 100.23],
    snowmtn: [27.09, 100.20],
    shangrila: [27.82, 99.70]
};

// 生成整条蜿蜒路径
let fullPath = [];
fullPath = fullPath.concat(generateCurvedPath(keyLocations.puer, keyLocations.dali, 0.8));
fullPath = fullPath.concat(generateCurvedPath(keyLocations.dali, keyLocations.lijiang, 0.3));
fullPath = fullPath.concat(generateCurvedPath(keyLocations.lijiang, keyLocations.snowmtn, 0.1));
fullPath = fullPath.concat(generateCurvedPath(keyLocations.snowmtn, keyLocations.shangrila, 0.4));


// 2. 故事章节配置 (核心逻辑)
const storyChapters = [
    {
        id: 'step-0',
        center: keyLocations.puer,
        zoom: 9,
        // 当滚动到这一页时，地图上显示的特色数据标签
        mapLabel: {
            text: '<i class="fa-solid fa-leaf"></i> 茶叶原产地',
            coords: [22.85, 101.0] // 稍微偏离中心一点显示
        }
    },
    {
        id: 'step-1',
        center: keyLocations.dali,
        zoom: 11,
        mapLabel: {
            text: '<i class="fa-solid fa-coins"></i> 贸易量: High',
            coords: [25.75, 100.20]
        }
    },
    {
        id: 'step-2',
        center: keyLocations.lijiang,
        zoom: 10,
        mapLabel: {
            text: '<i class="fa-solid fa-triangle-exclamation"></i> 险途开始',
            coords: [26.95, 100.25]
        }
    },
    {
        id: 'step-3',
        center: keyLocations.shangrila,
        zoom: 10,
        mapLabel: {
            text: '<i class="fa-solid fa-mountain-sun"></i> 海拔: 3280m',
            coords: [27.85, 99.75]
        }
    },
    {
        id: 'step-4',
        center: [25.5, 100.5], // 全览视角
        zoom: 6,
        mapLabel: null // 最后一页不显示标签
    }
];

// 3. 初始化地图
const map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: false,
    attributionControl: false
}).setView(storyChapters[0].center, storyChapters[0].zoom);

// 使用 CartoDB Voyager 底图 (比较干净、现代，有质感)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
}).addTo(map);

// 4. 绘制元素

// A. 绘制蜿蜒的路线
const routeLine = L.polyline(fullPath, {
    color: '#8b4513', // 茶马古道 - 深褐色
    weight: 3,
    opacity: 0.6,
    dashArray: '5, 10', // 虚线，模拟古道痕迹
    lineCap: 'round'
}).addTo(map);

// B. 添加主要站点的固定圆点
Object.values(keyLocations).forEach(coords => {
    L.circleMarker(coords, {
        radius: 6,
        fillColor: '#fff',
        color: '#8b4513',
        weight: 2,
        fillOpacity: 1
    }).addTo(map);
});

// C. 用于显示动态数据的 LayerGroup
const dataLabelLayer = L.layerGroup().addTo(map);

// 5. 交互逻辑 (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stepId = entry.target.id;
            const config = storyChapters.find(c => c.id === stepId);
            
            if (config) {
                // 1. 地图视角飞行
                map.flyTo(config.center, config.zoom, {
                    animate: true,
                    duration: 1.5,
                    easeLinearity: 0.25
                });

                // 2. 更新地图上的数据标签 (Data Label)
                dataLabelLayer.clearLayers(); // 清除上一个标签
                
                if (config.mapLabel) {
                    const icon = L.divIcon({
                        className: 'map-data-label',
                        html: config.mapLabel.text,
                        iconSize: [null, 30], // 自适应宽度
                        iconAnchor: [0, 15]   // 左侧对齐
                    });
                    
                    L.marker(config.mapLabel.coords, { icon: icon }).addTo(dataLabelLayer);
                }

                // 3. UI 激活状态
                document.querySelectorAll('.story-step').forEach(el => el.classList.remove('active'));
                entry.target.classList.add('active');
            }
        }
    });
}, {
    rootMargin: '-50% 0px -50% 0px', // 屏幕中心触发
    threshold: 0
});

document.querySelectorAll('.story-step').forEach(step => {
    observer.observe(step);
});

// 初始动画
window.onload = () => {
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
};