import { calcRotatedPoint,calcPhysicsPosition } from './helper'

export default class ClipMove {
  constructor(rectData, maskData, event) {
    this.startRectData = { ...rectData }
    this.startMaskData = { ...maskData }
    this.startMouseData = {
      x: event.clientX,
      y: event.clientY
    }
    this.init()
  }

  init () {
    this.startRectData.tempData = this.getRectData(this.startRectData)
    this.startMaskData.tempData = this.getRectData(this.startMaskData)
  }

  getRectData (data) {
    let { x, y, width, height, anchor } = data

    let center = {
      x: x + width * anchor.x,
      y: y + height * anchor.y,
    }

    let leftTop = {
      x,
      y,
    }
    let rotateLeftTop = calcRotatedPoint(leftTop, center, this.startRectData.rotate)
    return {
      center,
      rotateLeftTop
    }

  }

  handlerMove (event) {
    const diffX = event.clientX - this.startMouseData.x
    const diffY = event.clientY - this.startMouseData.y

    // 最大left top  最小left top
    let minLeft = 0
    let maxLeft = this.startRectData.width - this.startMaskData.width
    let minTop = 0
    let maxTop = this.startRectData.height - this.startMaskData.height

    // 旋转后的位置信息
    let startRectCenter = this.startRectData.tempData.center
    let startMaskRotatedPoint = this.startMaskData.tempData.rotateLeftTop
    let startMaskCenter = this.startMaskData.tempData.center

    // 图片移动的位置信息
    let newMaskRotatedPoint = {
      x: startMaskRotatedPoint.x + diffX,
      y: startMaskRotatedPoint.y + diffY,
    }

    let newMaskCenter = {
      x: startMaskCenter.x + diffX,
      y: startMaskCenter.y + diffY,
    }

    let newMaskPoint = calcRotatedPoint(
      newMaskRotatedPoint, // 新的mask 坐标
      startRectCenter, // rect的中心点
      -this.startRectData.rotate,
    )

    let radian = this.startRectData.rotate * (Math.PI / 180)

    let list = [newMaskRotatedPoint, newMaskCenter]

    const { x: physicsX, y: physicsY } = calcPhysicsPosition(this.startRectData)

    let projectionX = newMaskPoint.x - physicsX
    if (projectionX < minLeft || projectionX > maxLeft) {
      projectionX = (projectionX < minLeft ? minLeft : maxLeft) - projectionX
      list.forEach((item) => {
        item.x += Math.cos(radian) * projectionX
        item.y += Math.sin(radian) * projectionX
      });
    }

    let projectionY = newMaskPoint.y - physicsY
    if (projectionY < minTop || projectionY > maxTop) {
      projectionY = (projectionY < minTop ? minTop : maxTop) - projectionY
      list.forEach((item) => {
        item.x -= Math.sin(radian) * projectionY
        item.y += Math.cos(radian) * projectionY
      });
    }

    return calcRotatedPoint(
      newMaskRotatedPoint,
      newMaskCenter,
      -this.startRectData.rotate,
    )
  }
}
