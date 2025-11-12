class StoryMap {
    constructor() {
        this.map = null;
        this.scroller = null;
        this.currentStep = 0;
        this.routeLine = null;
        this.markers = [];
        
        this.init();
    }

    init() {
        this.initMap();
        this.initScrollama();
        this.drawRoute();
        this.addEventListeners();
    }

    initMap() {
        // 初始化地图
        this.map = L.map('story-map').setView([25.0452, 102.7097], 7);
        
        // 添加地图图层 - 使用浅色主题更好地突出内容
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        // 禁用地图拖动和缩放，让滚动成为主要交互方式
        this.map.scrollWheelZoom.disable();
        this.map.dragging.disable();
        this.map.touchZoom.disable();
        this.map.doubleClickZoom.disable();
        this.map.boxZoom.disable();
        this.map.keyboard.disable();
    }

    initScrollama() {
        this.scroller = scrollama();
        
        this.scroller
            .setup({
                step: '.story-step',
                offset: 0.5, // 当元素到达视口50%时触发
                progress: true,
                debug: false // 设为true可以看到调试线
            })
            .onStepEnter(this.handleStepEnter.bind(this))
            .onStepProgress(this.handleStepProgress.bind(this));
    }

    handleStepEnter(response) {
        const step = response.element;
        const stepNumber = parseInt(step.dataset.step);
        this.currentStep = stepNumber;
        
        // 更新激活状态
        document.querySelectorAll('.story-step').forEach(s => s.classList.remove('active'));
        step.classList.add('active');
        
        // 如果是介绍步骤，不移动地图
        if (stepNumber === 0) return;
        
        // 获取坐标和缩放级别
        const lat = parseFloat(step.dataset.lat);
        const lng = parseFloat(step.dataset.lng);
        const zoom = parseInt(step.dataset.zoom);
        
        // 平滑移动地图
        this.map.flyTo([lat, lng], zoom, {
            duration: 2 // 2秒动画
        });
        
        // 更新进度指示器
        this.updateProgressIndicator(stepNumber);
        
        // 添加或更新标记
        this.updateMarkers(stepNumber);
    }

    handleStepProgress(response) {
        // 可以在这里添加更精细的动画控制
        const progress = response.progress;
        // console.log(`Step ${response.index} progress: ${progress}`);
    }

    drawRoute() {
        // 绘制茶马古道路线
        this.routeLine = L.polyline(teaHorseRoute, {
            color: '#8B4513',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round'
        }).addTo(this.map);
    }

    updateMarkers(stepNumber) {
        // 清除之前的标记
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // 添加当前步骤的标记
        const stepData = storyData.find(data => data.step === stepNumber);
        if (stepData && stepData.markers) {
            stepData.markers.forEach(markerData => {
                const marker = L.marker([markerData.lat, markerData.lng])
                    .addTo(this.map)
                    .bindPopup(`
                        <div class="marker-popup">
                            <h3>${markerData.title}</h3>
                            <p>${markerData.description}</p>
                        </div>
                    `);
                
                this.markers.push(marker);
            });
        }
    }

    updateProgressIndicator(stepNumber) {
        const progress = (stepNumber / (storyData.length - 1)) * 100;
        document.querySelector('.progress-bar::after').style.width = `${progress}%`;
        
        // 更新位置名称高亮
        document.querySelectorAll('.location').forEach((loc, index) => {
            loc.classList.toggle('active', index === stepNumber - 1);
        });
    }

    addEventListeners() {
        // 开始旅程按钮
        document.getElementById('start-journey').addEventListener('click', () => {
            document.getElementById('story-container').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });

        // 窗口大小变化时重新计算
        window.addEventListener('resize', this.scroller.resize);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new StoryMap();
});