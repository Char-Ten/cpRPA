(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.cpRPA = factory();
    }
}(this, function() {

    function Main() {
        this.distance = null;
        this.center = {};
        this.latlngs = [];
        this.space = 5;
        this.deg = 0;
    }

    Main.prototype.setDistanceFn = function(fn) {
        if (typeof fn !== 'function') {
            throw new Error('setDistanceFn\'s argument must be a function');
            return
        }
        this.distance = fn;
    }

    Main.prototype.setOptions = function(opt) {
        if (!(opt.polygon instanceof Array)) {
            throw new Error('the "polygon" of options must be a Array like [{lat:Number,lng:Number}]')
            return
        }
        if (typeof opt.stepRotate !== 'number') {
            throw new Error('the "stepRotate" of options must be a number!');
            return
        }
        if (typeof opt.space !== 'number') {
            throw new Error('the "space" of options must be a number!');
            return
        }
        this.latlngs = opt.polygon;
        this.deg = opt.stepRotate;
        this.space = opt.space;
        this.center = createPolygonBounds(this.latlngs).center;
        return createStepPoints();
    }

    Main.prototype.transform = function(x, y, tx, ty, deg, sx, sy) {
        var deg = deg * Math.PI / 180;
        if (!sy) sy = 1;
        if (!sx) sx = 1;
        return [
            sx * ((x - tx) * Math.cos(deg) - (y - ty) * Math.sin(deg)) + tx,
            sy * ((x - tx) * Math.sin(deg) + (y - ty) * Math.cos(deg)) + ty
        ]
    }

    Main.prototype.calcPointInLineWithY = function(p1, p2, y) {
        var s = p1[1] - p2[1];
        var x;
        if (s) {
            x = (y - p1[1]) * (p1[0] - p2[0]) / s + p1[0]
        } else {
            return false
        }
        if (x > p1[0] && x > p2[0]) {
            return false
        }
        if (x < p1[0] && x < p2[0]) {
            return false
        }
        return [x, y]
    }

    var M = new Main();

    function createStepPoints() {
        var latlngs = M.latlngs;

        var tr_latlngs = [];
        var tr = null;
        for (var i = 0; i < latlngs.length; i++) {
            tr = M.transform(
                latlngs[i].lng,
                latlngs[i].lat,
                M.center.lng,
                M.center.lat,
                M.deg
            )
            tr_latlngs.push({
                lat: tr[1],
                lng: tr[0],
            })
        }

        var bounds = createPolygonBounds(tr_latlngs);
        var nw = bounds.nw;
        var ne = bounds.ne;
        var sw = bounds.sw;

        if (typeof M.distance !== 'function') {
            throw new Error('You must call the ".setDistanceFn" method and set a function to calculate the distance!');
            return
        }
        var distance = M.distance({
            lat: nw.lat,
            lng: nw.lng
        }, {
            lat: sw.lat,
            lng: sw.lng
        })
        var steps = parseInt(distance / M.space / 2);
        var stepLat = (nw.lat - sw.lat) / steps;
        var points = [];
        var line = [];
        var check = null;

        //N*N
        for (var i = 0; i < steps; i++) {
            line = [];

            for (var j = 0; j < tr_latlngs.length; j++) {
                check = M.calcPointInLineWithY([
                    tr_latlngs[j].lng,
                    tr_latlngs[j].lat
                ], [
                    tr_latlngs[si(j + 1, tr_latlngs.length)].lng,
                    tr_latlngs[si(j + 1, tr_latlngs.length)].lat
                ], nw.lat - i * stepLat);
                if (check) {
                    line.push(check);
                }
            }

            if (line.length < 2) {
                continue;
            }
            if (line[0][0] === line[1][0]) {
                continue;
            }
            if (i % 2) {
                points.push({
                    lat: line[0][1],
                    lng: Math.max(line[0][0], line[1][0]),
                }, {
                    lat: line[0][1],
                    lng: Math.min(line[0][0], line[1][0])
                })
            } else {
                points.push({
                    lat: line[0][1],
                    lng: Math.min(line[0][0], line[1][0]),
                }, {
                    lat: line[0][1],
                    lng: Math.max(line[0][0], line[1][0])
                })
            }
        }

        var _points = [];
        for (var i = 0; i < points.length; i++) {
            tr = M.transform(
                points[i].lng,
                points[i].lat,
                M.center.lng,
                M.center.lat, -M.deg
            )
            _points.push({
                lat: tr[1],
                lng: tr[0],
            });
        }
        return _points
    }

    function createPolygonBounds(latlngs) {
        var lats = [];
        var lngs = [];

        //N
        for (var i = 0; i < latlngs.length; i++) {
            lats.push(latlngs[i].lat);
            lngs.push(latlngs[i].lng);
        }

        var maxLat = Math.max.apply(null, lats);
        var maxLng = Math.max.apply(null, lngs);
        var minLat = Math.min.apply(null, lats);
        var minLng = Math.min.apply(null, lngs);
        var centerLat = (maxLat + minLat) / 2;
        var centerLng = (maxLng + minLng) / 2;

        return {
            nw: {
                lat: maxLat,
                lng: minLng
            },
            ne: {
                lat: maxLat,
                lng: maxLng,
            },
            se: {
                lat: minLat,
                lng: maxLng,
            },
            sw: {
                lat: minLat,
                lng: minLng
            },
            center: {
                lat: centerLat,
                lng: centerLng
            },
            max: [maxLat, maxLng],
            min: [minLat, minLng],

        }
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
    return M;
}));