var ctrlBtn = document.getElementById('ctrlBtn');
var crtStepBtn = document.getElementById('crtStepBtn');
var spaceInp = document.getElementById('spaceInp');
var stepRotate = document.getElementById('stepRotate');
var stepRotateBox = document.getElementById('stepRotateBox');
var stepRotateValue = document.getElementById('stepRotateValue');
var map = L.map('app').setView([23.129704666325214, 113.26445102691652], 22);
var state = {
    isReadyDrawPolygon: false,
    isBeginDraw: false
}
var polygon = {
    layer: L.polygon([], {
        color: '#f00',
        fillColor: '#f5f5f5',
        weight: 1,
        fillOpacity: 0.5,
        opacity: 1
    }).addTo(map),
    latlngs: [],
};
var polyline = {
    layer: L.polyline([], {
        color: '#0f0',
        weight: 2,
        opacity: 1
    }).addTo(map),
    latlngs: []
}
cpRPA.setDistanceFn(distance);
cpRPA.setLatlng2PxFn(latlng2Px);
cpRPA.setPx2LatlngFn(px2Latlng);

L.tileLayer('https://mt2.google.cn/vt/lyrs=s@110&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s={s}').addTo(map);

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
        this.innerText = "清除";
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
        polygon.latlngs.push(e.latlng);
        polygon.layer.setLatLngs(polygon.latlngs);
    }
    if (polygon.latlngs.length > 2) {
        crtStepBtn.className = spaceInp.className = stepRotateBox.className = "";
    }
});


function initDraw() {
    polygon.latlngs = polyline.latlngs = [];
    polygon.layer.setLatLngs(polygon.latlngs);
    polyline.layer.setLatLngs(polyline.latlngs);
    crtStepBtn.className = spaceInp.className = stepRotateBox.className = "hide";
}


function renderPolyline() {
    polyline.latlngs = cpRPA.setOptions({
        polygon: polygon.latlngs,
        rotate: parseFloat(stepRotate.value) || 0,
        space: parseFloat(spaceInp.value) || 5
    });

    polyline.layer.setLatLngs(polyline.latlngs)
}



function distance(p1, p2) {
    return L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng))
}

function latlng2Px(latlng) {
    return map.latLngToLayerPoint(L.latLng(latlng.lat, latlng.lng))
}

function px2Latlng(px) {
    return map.layerPointToLatLng(L.point(px[0], px[1]))
}

function calcScale() {
    var a = calcArea(polygon.layer.getLatLngs()[0]);
    var b = calcLineArea(polyline.layer.getLatLngs(), parseFloat(spaceInp.value) || 5);
    console.log('polygon:', a);
    console.log('polyline:', b);
    return a / b
}

function calcArea(latlngs) {
    var S = 0;
    for (var i = 0; i < latlngs.length; i++) {
        S += X(latlngs[i]) * Y(latlngs[si(i + 1, latlngs.length)]) - Y(latlngs[i]) * X(latlngs[si(i + 1, latlngs.length)])
    }
    return Math.abs(S) / 2

    function X(latlng) {
        return latlng.lng * lng2m(latlng);
    }

    function Y(latlng) {
        return latlng.lat * lat2m(latlng);
    }

}

function calcLineArea(latlngs, space) {
    var S = 0;
    for (var i = 0; i < latlngs.length; i += 2) {
        var j = si(i + 1, latlngs.length);
        S += distance(latlngs[i], latlngs[j]);
    }
    return S * space * 2
}

function lat2m(latlng) {
    return distance(latlng, {
        lat: latlng.lat + 1,
        lng: latlng.lng
    })
}

function lng2m(latlng) {
    return distance(latlng, {
        lat: latlng.lat,
        lng: latlng.lng + 1
    });
}

function si(i, l) {
    if (i > l - 1) {
        return i - l;
    }
    if (i < 0) {
        return l + i;
    }
    return i;
}