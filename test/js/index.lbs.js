var ctrlBtn = document.getElementById('ctrlBtn');
var crtStepBtn = document.getElementById('crtStepBtn');
var spaceInp = document.getElementById('spaceInp');
var stepRotate = document.getElementById('stepRotate');
var stepRotateBox = document.getElementById('stepRotateBox');
var stepRotateValue = document.getElementById('stepRotateValue');
var map = new AMap.Map("app", {
    resizeEnable: true,
    zoom: 22,
    center: [113.26526520273109, 23.129910714285714]
});
var state = {
    isReadyDrawPolygon: false,
    isBeginDraw: false
}
var polygon = {
    layer: new AMap.Polygon({
        map: map,
        strokeColor: '#f00',
        fillColor: '#f5f5f5',
        strokeWeight: 1,
        fillOpacity: 0.5,
        strokeOpacity: 1
    }),
    latlngs: [],
};
var polyline = {
    layer: new AMap.Polyline({
        map: map,
        strokeColor: '#0f0',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
cpRPA.setDistanceFn(distance);
cpRPA.setLatlng2PxFn(latlng2Px);
cpRPA.setPx2LatlngFn(px2Latlng);

stepRotate.addEventListener('change', function() {
    stepRotateValue.innerText = this.value;
});
stepRotate.addEventListener('input', function() {
    stepRotateValue.innerText = this.value;
    renderPolyline();
})

ctrlBtn.addEventListener('click', function() {
    state.isReadyDrawPolygon = !state.isReadyDrawPolygon;
    if (state.isReadyDrawPolygon) {
        this.innerText = "清除"
        map.add([polygon.layer, polyline.layer]);
    } else {
        this.innerText = "绘制凸多边形地块"
        initDraw();
    }
});

crtStepBtn.addEventListener('click', function() {
    renderPolyline();
})

map.on('click', function(e) {
    if (state.isReadyDrawPolygon) {
        polygon.latlngs.push(e.lnglat);
        polygon.layer.setPath(polygon.latlngs);
    }
    if (polygon.latlngs.length > 2) {
        crtStepBtn.className = spaceInp.className = stepRotateBox.className = "";
    }
});


function initDraw() {
    polygon.latlngs = [];
    polygon.layer.setPath(polygon.latlngs);
    polyline.latlngs = [];
    polyline.layer.setPath(polyline.latlngs);
    crtStepBtn.className = spaceInp.className = stepRotateBox.className = "hide";
}


function renderPolyline() {
    polyline.latlngs = cpRPA.setOptions({
        polygon: polygon.latlngs,
        rotate: parseFloat(stepRotate.value) || 0,
        space: parseFloat(spaceInp.value) || 5
    });
    polyline.layer.setPath(
        mapLatlng2Apoint(polyline.latlngs)
    )
}

function mapLatlng2Apoint(arr) {
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        a.push(new AMap.LngLat(arr[i].lng, arr[i].lat));
    }
    return a
}


function distance(p1, p2) {
    return new AMap.LngLat(p1.lng, p1.lat).distance(new AMap.LngLat(p2.lng, p2.lat))
}

function latlng2Px(latlng) {
    return map.lngLatToContainer(new AMap.LngLat(latlng.lng, latlng.lat))
}

function px2Latlng(px) {
    return map.containerToLngLat(new AMap.Pixel(px[0], px[1]))
}