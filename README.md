# cpRPA
植保无人机凸多边形地块工作路线规划

## 快速使用
1. 通过普通script标签引入，也支持cmd amd引入
2. 根据所使用的地图类型不同，需要在使用前传入当前地图两个点距离的计算方法：  
```javascript
/**@method 设置距离计算方法
 * @param {Function} 传入计算的函数
 * @param {Object} p1 该函数接收的第一个点，格式为{lat,lng} lat为纬度，lng为经度
 * @param {Object} p2 同上，第二个点
 */
cpRPA.setDistanceFn(function(p1,p2){
    /**以百度地图为例子，百度地图获取两经纬度点距离的方法：*/
    return new BMap.Map().getDistance(new BMap.Point(p1.lng, p1.lat), new BMap.Point(p2.lng, p2.lat));

    /** 
    * 高德地图获取两经纬度点距离的方法：
    return new AMap.LngLat(p1.lng, p1.lat).distance(new AMap.LngLat(p2.lng, p2.lat));

    * leaflet框架获取两经纬度点距离的方法
    return L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng))
    */
});
```
3. 执行`.setOptions`方法，获得计算完的点集  
```javascript
var steps=cpRPA.setOptions({
    polygon:[/*凸多边形顶点点集*/],
    stepRotate:0,
    space: 5
});
console.log(steps)
```

---
## 方法：
* `setDistanceFn`   
设置距离计算方法
，接收一个函数"`function(p1,p2){return /**具体地图类型的距离计算方法*/}`"，必须在第一个`.setOptions`方法前设置
* `setOptions`  
设置输入参数，返回航线点集
    <table>
        <tr>
            <th>参数</th><th>类型</th><th>说明</th>
        </tr>
        <tr>
            <td>polygon</td>
            <td>Array</td>
            <td>凸多边形的顶点集</td>
        </tr>
        <tr>
            <td>stepRotate</td>
            <td>Number</td>
            <td>航线围绕地块中心点的旋转角度，顺时针为+，逆时针为-</td>
        </tr>
        <tr>
            <td>space</td>
            <td>Number</td>
            <td>无人机飞行相邻两条航线距离的一半。比如说，无人机翼展为5米，则两条航线之间的合理距离为10米，则space的值为5</td>
        </tr>
    </table>


## demo
* [百度地图demo]()
* [高德地图demo]()
* [leaflet地图demo]()