var ctrlBtn = document.getElementById('ctrlBtn');
var crtStepBtn = document.getElementById('crtStepBtn');
var spaceInp = document.getElementById('spaceInp');
var stepRotate = document.getElementById('stepRotate');
var stepRotateBox = document.getElementById('stepRotateBox');
var stepRotateValue = document.getElementById('stepRotateValue');
var map = new BMap.Map("app");
var state = {
    isReadyDrawPolygon: false,
    isBeginDraw: false
}
var polygon = {
    layer: new BMap.Polygon([], {
        strokeColor: '#f00',
        fillColor: '#f5f5f5',
        strokeWeight: 1,
        fillOpacity: 0.5,
        strokeOpacity: 1
    }),
    latlngs: [],
};
var polyline = {
    layer: new BMap.Polyline([], {
        strokeColor: '#0f0',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
map.centerAndZoom("广州", 22);
map.enableScrollWheelZoom(true);
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
        map.addOverlay(polygon.layer);
        map.addOverlay(polyline.layer);
    } else {
        this.innerText = "绘制凸多边形地块"
        initDraw();
    }
});

crtStepBtn.addEventListener('click', function() {
    renderPolyline();
})

map.addEventListener('click', function(e) {
    if (state.isReadyDrawPolygon) {
        polygon.latlngs.push(e.point);
        polygon.layer.setPath(polygon.latlngs);
    }
    if (polygon.latlngs.length > 2) {
        crtStepBtn.className = spaceInp.className = stepRotateBox.className = "";
    }
});


function initDraw() {
    map.clearOverlays();
    polygon.latlngs = polyline.latlngs = [];
    polygon.layer.setPath(polygon.latlngs);
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
        mapLatlng2Bpoint(polyline.latlngs)
    )
}

function mapLatlng2Bpoint(arr) {
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        a.push(new BMap.Point(arr[i].lng, arr[i].lat));
    }
    return a
}


function distance(p1, p2) {
    return map.getDistance(new BMap.Point(p1.lng, p1.lat), new BMap.Point(p2.lng, p2.lat))
}

function latlng2Px(latlng) {
    return map.pointToPixel(new BMap.Point(latlng.lng, latlng.lat))
}

function px2Latlng(px) {
    return map.pixelToPoint(new BMap.Pixel(px[0], px[1]))
}