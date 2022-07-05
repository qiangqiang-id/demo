import  ScaleHandler  from './scale'
import { POSITION } from '../constants';
import { calcPhysicsPosition, calcRotatedPoint } from './helper'


export default class ClipScale {
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
