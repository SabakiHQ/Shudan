exports.alpha = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'

exports.range = n => [...Array(n)].map((_, i) => i)
exports.random = n => Math.floor(Math.random() * n)
exports.vertexEquals = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2
exports.lineEquals = ([v1, w1], [v2, w2]) => exports.vertexEquals(v1, v2) && exports.vertexEquals(w1, w2)

exports.floorEven = function(float) {
    let value = Math.floor(float)
    return value % 2 === 0 ? value : value - 1
}

exports.getHoshis = function(width, height) {
    if (Math.min(width, height) < 6) return []

    let [nearX, nearY] = [width, height].map(x => x >= 13 ? 3 : 2)
    let [farX, farY] = [width - nearX - 1, height - nearY - 1]
    let [middleX, middleY] = [width, height].map(x => (x - 1) / 2)
    
    let result = [[nearX, farY], [farX, nearY], [farX, farY], [nearX, nearY]]

    if (width % 2 !== 0 && height % 2 !== 0)
        result.push([middleX, middleY])
    if (width % 2 !== 0)
        result.push([middleX, nearY], [middleX, farY])
    if (height % 2 !== 0)
        result.push([nearX, middleY], [farX, middleY])

    return result
}
