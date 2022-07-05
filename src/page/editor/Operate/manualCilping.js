import { ScaleHandler } from './scale'
import { POSITION } from '../constants';
import { calcPhysicsPosition, calcRotatedPoint } from './helper'

export default class MaskMove {
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

export class MasKScale {
  constructor(rectData, maskData, type) {
    this.startRectData = { ...rectData }
    this.startMaskData = { ...maskData }
    this.type = type
    this.scaleHandler = new ScaleHandler(this.startRectData.rotate, type, this.startMaskData, this.getScaleOption())

  }

  getScaleOption () {
    const { width: maxWidth, height: maxHeight } = this.calcMaxWidthAndMaxHeight()
    return {
      maxWidth,
      maxHeight,
      minWidth: 20,
      minHeight: 20,
      isLockProportions: false
    }
  }

  getRectData (data) {
    const { x, y, width, height, anchor = { x: 0.5, y: 0.5 } } = data
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

  handlerScale (mousePosition) {
    return this.scaleHandler.handlerScale(mousePosition)
  }

  calcMaxWidthAndMaxHeight () {

    const { width: rectW, height: rectH, } = this.startRectData
    const { width: maskW, height: maskH, } = this.startMaskData
    let { x: maskX, y: maskY } = this.clacMaskPositionInRect()
    let maxData
    switch (this.type) {
      case POSITION.leftCenter: {
        maxData = {
          width: rectW - (rectW - (maskX + maskW)),
          height: maskH,
        }
        break
      }
      case POSITION.leftTop: {
        maxData = {
          width: rectW - (rectW - (maskX + maskW)),
          height: rectH - (rectH - (maskY + maskH))
        }
        break
      }
      case POSITION.leftBottom: {
        maxData = {
          width: rectW - (rectW - (maskX + maskW)),
          height: rectH - maskY
        }
        break
      }
      case POSITION.topCenter: {
        maxData = {
          width: maskW,
          height: rectH - (rectH - (maskY + maskH))
        }
        break
      }
      case POSITION.rightTop: {
        maxData = {
          width: rectW - maskX,
          height: rectH - (rectH - (maskY + maskH)),

        }
        break
      }
      case POSITION.rightCenter: {
        maxData = {
          width: rectW - maskX,
          height: maskH
        }
        break
      }
      case POSITION.rightBottom: {
        maxData = {
          width: rectW - maskX,
          height: rectH - maskY
        }
        break
      }

      case POSITION.bottomCenter: {
        maxData = {
          width: maskW,
          height: rectH - maskY
        }
      }
    }

    return maxData
  }

  clacMaskPositionInRect () {
    const maskData = this.startMaskData
    const rectData = this.startRectData

    const rectTempData = this.getRectData(rectData)
    const maskTempData = this.getRectData(maskData)

    const newRectData = calcRotatedPoint(rectTempData.rotateLeftTop, maskTempData.center, -rectData.rotate)
    const { x: physicsX, y: physicsY } = calcPhysicsPosition({ ...rectData, ...newRectData })
    return {
      x: maskData.x - physicsX,
      y: maskData.y - physicsY,
    }

  }
}
