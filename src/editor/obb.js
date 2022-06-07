// https://www.cnblogs.com/iamzhanglei/archive/2012/06/07/2539751.html

export class Vector2d {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

Vector2d.prototype = {
  sub: function (v) {
    return new Vector2d(this.x - v.x, this.y - v.y)
  },
  dot: function (v) {
    return this.x * v.x + this.y * v.y
  },
}


export class OBB {
  constructor(centerPoint, width, height, rotation) {
    this.centerPoint = centerPoint
    this.extents = [width / 2, height / 2]
    this.axes = [
      new Vector2d(Math.cos(rotation), Math.sin(rotation)),
      new Vector2d(-1 * Math.sin(rotation), Math.cos(rotation)),
    ]
    this._width = width
    this._height = height
    this._rotation = rotation
  }
}

OBB.prototype = {
  getProjectionRadius: function (axis) {
    return (
      this.extents[0] * Math.abs(axis.dot(this.axes[0])) +
      this.extents[1] * Math.abs(axis.dot(this.axes[1]))
    )
  },
}

export function isCollision (rect1, rect2) {
  var nv = rect1.centerPoint.sub(rect2.centerPoint)
  var axisA1 = rect1.axes[0]
  if (
    rect1.getProjectionRadius(axisA1) + rect2.getProjectionRadius(axisA1) <=
    Math.abs(nv.dot(axisA1))
  )
    return false
  var axisA2 = rect1.axes[1]
  if (
    rect1.getProjectionRadius(axisA2) + rect2.getProjectionRadius(axisA2) <=
    Math.abs(nv.dot(axisA2))
  )
    return false
  var axisB1 = rect2.axes[0]
  if (
    rect1.getProjectionRadius(axisB1) + rect2.getProjectionRadius(axisB1) <=
    Math.abs(nv.dot(axisB1))
  )
    return false
  var axisB2 = rect2.axes[1]
  if (
    rect1.getProjectionRadius(axisB2) + rect2.getProjectionRadius(axisB2) <=
    Math.abs(nv.dot(axisB2))
  )
    return false
  return true
}