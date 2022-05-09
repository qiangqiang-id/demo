import { calcRotatedPoint, ScaleHandler } from './drag'
import { POSITION } from './constants';

export class MaskMove {
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
    const { x, y, width, height, anchor } = data
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
    // let startRectRotatedPoint = this.startRectData.tempData.rotateLeftTop
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

    let projectionX = newMaskPoint.x - this.startRectData.x
    if (projectionX < minLeft || projectionX > maxLeft) {
      projectionX = (projectionX < minLeft ? minLeft : maxLeft) - projectionX
      list.forEach((item) => {
        item.x += Math.cos(radian) * projectionX
        item.y += Math.sin(radian) * projectionX
      });
    }

    let projectionY = newMaskPoint.y - this.startRectData.y
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
    this.scaleHandler = new ScaleHandler(this.startRectData, type, this.startMaskData, false)

    this.startMaskPosiotnInRect = this.clacMaskPositionInRect(maskData)
    // 边界值
    this.boundaryData = this.getBoundaryData()
  }

  updatedTempData (mousePosition) {
    const rectTempData = this.getRectData(this.startRectData)
    const maskTempData = this.getRectData(mousePosition)

    return {
      rectTempData,
      maskTempData
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
    const newMaskData = this.scaleHandler.handlerScale(mousePosition)
    const {
      minLeft,
      maxLeft,
      minTop,
      maxTop,
      maxHeight,
      maxWidth
    } = this.boundaryData

    if (newMaskData.width > maxWidth) newMaskData.width = maxWidth
    if (newMaskData.height > maxHeight) newMaskData.height = maxHeight

    const { rectTempData, maskTempData } = this.updatedTempData(newMaskData)

    // 图片移动的位置信息
    let newMaskRotatedPoint = {
      x: maskTempData.rotateLeftTop.x,
      y: maskTempData.rotateLeftTop.y,
    }

    const newMaskCenter = {
      x: maskTempData.center.x,
      y: maskTempData.center.y
    }

    // const { x: maskX, y: maskY } = this.startMaskPosiotnInRect


    // 已rect 的中心点，将mask的旋转点，回正
    let newMaskPoint = calcRotatedPoint(
      newMaskRotatedPoint, // 新的mask 坐标
      rectTempData.center, // rect的中心点
      -this.startRectData.rotate,
    )

    let radian = this.startRectData.rotate * (Math.PI / 180)

    let list = [newMaskRotatedPoint, newMaskCenter]




    // 计算是否超出rect的范围
    let projectionX = newMaskPoint.x - this.startRectData.x
    if (projectionX < minLeft || projectionX > maxLeft) {
      projectionX = (projectionX < minLeft ? minLeft : maxLeft) - projectionX
      list.forEach((item) => {
        item.x += Math.cos(radian) * projectionX
        item.y += Math.sin(radian) * projectionX
      });
    }

    let projectionY = newMaskPoint.y - this.startRectData.y
    if (projectionY < minTop || projectionY > maxTop) {
      projectionY = (projectionY < minTop ? minTop : maxTop) - projectionY
      list.forEach((item) => {
        item.x -= Math.sin(radian) * projectionY
        item.y += Math.cos(radian) * projectionY
      });
    }

    const data = calcRotatedPoint(
      newMaskRotatedPoint,
      newMaskCenter,
      -this.startRectData.rotate,
    )


    return {
      ...data,
      width: newMaskData.width,
      height: newMaskData.height,
    }

    // 糟糕
  }
  getBoundaryData () {
    let { width, height } = this.calcMaxWidthAndHeight()

    let result = {
      minLeft: 0,
      minTop: 0,
      maxLeft: this.startRectData.width - width,
      maxTop: this.startRectData.height - height,
      maxWidth: width,
      maxHeight: height
    }

    console.log(width, height)

    return result
  }

  calcMaxWidthAndHeight () {

    const { width: rectW, height: rectH, } = this.startRectData
    const { width: maskW, height: maskH, } = this.startMaskData
    const { x: maskX, y: maskY } = this.startMaskPosiotnInRect

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
          height: rectH - maskX
        }
      }
    }
    return maxData
  }

  clacMaskPositionInRect (newMaskData) {
    const { rectTempData, maskTempData } = this.updatedTempData(newMaskData)

    const newRectData = calcRotatedPoint(rectTempData.rotateLeftTop, maskTempData.center, -this.startRectData.rotate)
    return {
      x: newMaskData.x - newRectData.x,
      y: newMaskData.y - newRectData.y,
    }

  }
}
