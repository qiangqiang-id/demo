
import  ScaleHandler from './scale'
import { POSITION } from '../constants';
import { calcRotatedPoint } from './helper'

export default class MaskScale {
  constructor(containerStartData, type, isAutoClip = true) {
    // 父容器的开始位置
    this.startData = { ...containerStartData, }
    this.maskData = { ...containerStartData.mask }
    this.positionType = type
    this.scaleHandler = new ScaleHandler(containerStartData.rotate, type, this.getMaskInEditerAreaPosition(), { isLockProportions: true })
    this.rectPosition = this.init(containerStartData)
    this.isAutoClip = isAutoClip
  }

  // 获取mask 在 画布中的 位置
  getMaskInEditerAreaPosition () {
    const data = this.startData
    const mask = data.mask
    return {
      x: data.x + mask.x,
      y: data.y + mask.y,
      width: mask.width,
      height: mask.height
    }
  }

  // 根据开始位置，旋转后的左上角的位置
  init () {
    const { x, y, mask, rotate } = this.startData
    const startCenterPoint = {
      x: x + mask.x + mask.width / 2,
      y: y + mask.y + mask.height / 2
    }
    // 根据开始位置，旋转后的左上角的位置
    return calcRotatedPoint({ x, y }, startCenterPoint, rotate)
  }

  handleScale (mousePosition, type) {

    // mask 以画布为基础，做拖拽计算
    const poi = this.scaleHandler.handlerScale(mousePosition)
    // 中心点发生变化重新计算rect 的位置 , 保证统一旋转点
    let rectData = this.resetToRectPosition(poi)
    // 监测mask 是否在rect 的内容，精度丢失需要处理
    if (this.isAutoClip) {
      rectData = this.toRectPosition(poi, rectData, type)
    } else {
      rectData.width = this.startData.width
      rectData.height = this.startData.height
    }
    const maskData = this.toMaskOpsitionInRect(poi, rectData)

    //计算锚点
    const rateX = (rectData.x + maskData.x + maskData.width / 2 - rectData.x) / rectData.width;
    const rateY = (rectData.y + maskData.y + maskData.height / 2 - rectData.y) / rectData.height;

    rectData.anchor = {
      x: rateX,
      y: rateY
    }

    return {
      maskData,
      rectData
    }
  }


  //2： 中心点发生变化重新计算rect 的位置 , 保证统一旋转点
  resetToRectPosition (maskData) {
    const currentCenterPoint = {
      x: maskData.x + maskData.width / 2,
      y: maskData.y + maskData.height / 2
    }
    // 根据改变的中心点，计算出旋转的位置
    return calcRotatedPoint({ x: this.rectPosition.x, y: this.rectPosition.y }, currentCenterPoint, -this.startData.rotate)
  }

  keepDecimal (result, unit) {
    return Math.floor(result * Math.pow(10, unit)) / Math.pow(10, unit)
  }

  getMaskAndRectPoint (maskData, newLeftTop, isInt = false) {
    let data = {
      maskX: maskData.x,
      maskY: maskData.y,
      maskW: maskData.width,
      maskH: maskData.height,
      rectX: newLeftTop.x,
      rectY: newLeftTop.y,
      rectW: this.startData.width,
      rectH: this.startData.height,
    }
    const startMaskCenter = {
      x: newLeftTop.x + this.maskData.x + this.maskData.width / 2,
      y: newLeftTop.y + this.maskData.y + this.maskData.height / 2
    }
    const { x, y } = this.startData.scale
    // 如果发生翻转 计算真实的物理位置 
    if (x < 0) {
      // 计算真实的物理位置
      data.rectX = startMaskCenter.x - (newLeftTop.x + this.startData.width - startMaskCenter.x)
    }
    if (y < 0) {
      data.rectY = startMaskCenter.y - (newLeftTop.y + this.startData.height - startMaskCenter.y)
    }

    if (isInt) {
      Object.keys(data).forEach((key) => {
        data[key] = this.keepDecimal(data[key], 0)
      })
    }

    let { maskX, maskY, maskW, maskH, rectX, rectY, rectW, rectH } = data
    const maskTopLeft = [maskX, maskY]
    const maskBottomRight = [maskX + maskW, maskY + maskH]
    const rectTopLeft = [rectX, rectY]
    const rectBottomRight = [rectX + rectW, rectY + rectH]

    return {
      maskTopLeft, maskBottomRight, rectTopLeft, rectBottomRight
    }
  }

  //3： 判断mask 是否在 rect 内部
  isMaskInRect (maskData, newLeftTop, type) {
    // 存在精度丢失问题，暂时先换算成整数
    const { maskTopLeft, maskBottomRight, rectTopLeft, rectBottomRight } = this.getMaskAndRectPoint(maskData, newLeftTop, true)
    // 因为mask 和rect 的旋转点是相同的，所以可以这样比较。每条边单独判断，进而不会收到精度丢失的影响
    switch (type) {
      case POSITION.leftCenter: {
        return maskTopLeft[0] >= rectTopLeft[0]
      }
      case POSITION.rightCenter: {
        return maskBottomRight[0] <= rectBottomRight[0]
      }
      case POSITION.topCenter: {
        return maskTopLeft[1] >= rectTopLeft[1]
      }
      case POSITION.bottomCenter: {
        return maskBottomRight[1] <= rectBottomRight[1]
      }
    }
  }

  dragAroundPoint (maskPosition, newRectLeftTop, type) {
    let result
    const startWidthRate = this.startData.width / this.maskData.width
    const startHeightRate = this.startData.height / this.maskData.height
    const width = maskPosition.width * startWidthRate
    const height = maskPosition.height * startHeightRate
    const diffW = maskPosition.width - this.maskData.width
    const diffH = maskPosition.height - this.maskData.height

    const rateW = width / this.startData.width
    const rateH = height / this.startData.height

    const diffMaskX = this.maskData.x * rateW - this.maskData.x
    const diffMaskY = this.maskData.y * rateH - this.maskData.y

    switch (type) {
      case POSITION.leftTop: {
        result = {
          x: newRectLeftTop.x - diffW - diffMaskX,
          y: newRectLeftTop.y - diffH - diffMaskY,
          width,
          height
        }
        break
      }
      case POSITION.rightTop: {
        result = {
          x: newRectLeftTop.x - diffMaskX,
          y: newRectLeftTop.y - diffH - diffMaskY,
          width,
          height
        }
        break
      }
      case POSITION.leftBottom: {
        result = {
          x: newRectLeftTop.x - diffW - diffMaskX,
          y: newRectLeftTop.y - diffMaskY,
          width,
          height
        }
        break
      }
      case POSITION.rightBottom: {
        result = {
          x: newRectLeftTop.x - diffMaskX,
          y: newRectLeftTop.y - diffMaskY,
          width,
          height
        }
        break
      }

    }
    return result

  }

  dragCenterPoint (maskPosition, newRectLeftTop, type) {
    let result

    // 开始矩形的右下坐标
    const startRectRightBottom = {
      x: newRectLeftTop.x + this.startData.width,
      y: newRectLeftTop.y + this.startData.height
    }
    // 开始矩形的左上坐标
    const startRectLeftTop = {
      x: newRectLeftTop.x,
      y: newRectLeftTop.y,
    }
    //  开始蒙层的左上坐标
    const startMaskRigthBottom = {
      x: newRectLeftTop.x + this.maskData.x + this.maskData.width,
      y: newRectLeftTop.y + this.maskData.y + this.maskData.height
    }
    //  开始蒙层的右下坐标
    const startMaskLeftTop = {
      x: newRectLeftTop.x + this.maskData.x,
      y: newRectLeftTop.y + this.maskData.y
    }
    // 开始蒙层的中心点 以原图为基准
    const startMaskCenterInRect = {
      x: this.maskData.x + this.maskData.width / 2,
      y: this.maskData.y + this.maskData.height / 2
    }
    // 开始蒙层的中心点 以画布为基准
    const startMaskCenterInCanves = {
      x: newRectLeftTop.x + this.maskData.x + this.maskData.width / 2,
      y: newRectLeftTop.y + this.maskData.y + this.maskData.height / 2
    }

    const isMaskInRect = this.isMaskInRect(maskPosition, newRectLeftTop, type)
    if (isMaskInRect) {

      // 滑动的过快，会导致更新不过来，手动回到原始大小
      result = {
        width: this.startData.width,
        height: this.startData.height,
        x: newRectLeftTop.x,
        y: newRectLeftTop.y
      }

      const { x, y } = this.startData.scale
      if (x < 0) {
        switch (type) {
          case POSITION.rightCenter: {
            // 计算mask x轴 扩大的长度
            const diffX = maskPosition.x + maskPosition.width - startMaskRigthBottom.x
            result.x += diffX
            break
          }
          case POSITION.leftCenter: {
            const diffX = startMaskLeftTop.x - maskPosition.x
            result.x -= diffX
            break
          }
        }
      }
      if (y < 0) {
        switch (type) {
          case POSITION.bottomCenter: {
            const diffY = maskPosition.y + maskPosition.height - startMaskRigthBottom.y
            result.y += diffY
            break
          }
          case POSITION.topCenter: {
            const diffY = startMaskLeftTop.y - maskPosition.y
            result.y -= diffY
            break
          }
        }
      }

    } else {

      // 矩形开始的宽高比
      const startRectSizeRate = this.startData.height / this.startData.width

      const { x, y } = this.startData.scale
      // 物理位置  x轴 y轴
      const physicsX = startMaskCenterInCanves.x - (newRectLeftTop.x + this.startData.width - startMaskCenterInCanves.x)
      const physicsY = startMaskCenterInCanves.y - (newRectLeftTop.y + this.startData.height - startMaskCenterInCanves.y)

      switch (type) {
        case POSITION.rightCenter: {
          // mask 和 rect 同比例缩放，弥补宽度
          const maskWidthDiff = x > 0 ? startRectRightBottom.x - startMaskRigthBottom.x : startMaskLeftTop.x - startRectLeftTop.x
          const startWidthRate = this.startData.width / (this.maskData.width + maskWidthDiff)
          const width = maskPosition.width * startWidthRate
          const height = width * startRectSizeRate
          const diffH = height - this.startData.height

          // x 的距离也是需要同比例增大
          const rateW = width / this.startData.width
          const maskStartX = this.maskData.x - newRectLeftTop.x
          const diffMaskX = x > 0 ? this.maskData.x * rateW - this.maskData.x : this.maskData.x - maskStartX - maskPosition.x

          const anchorY = startMaskCenterInRect.y / this.startData.height

          result = {
            x: newRectLeftTop.x - diffMaskX,
            y: newRectLeftTop.y - diffH * anchorY,
            width,
            height
          }
          break;
        }
        case POSITION.leftCenter: {
          const maskWidthDiff = x > 0 ? startMaskLeftTop.x - startRectLeftTop.x : startRectRightBottom.x - startMaskRigthBottom.x
          const startWidthRate = this.startData.width / (this.maskData.width + maskWidthDiff)

          const width = maskPosition.width * startWidthRate
          const height = width * startRectSizeRate
          const diffH = height - this.startData.height

          // 开始右侧的差距
          const diff = startRectRightBottom.x - startMaskRigthBottom.x
          // mask 的开始坐标，应该是和rect 的x 重合的时候。 
          const maskStartX = this.maskData.x - newRectLeftTop.x
          const diffMaskX = x > 0 ? this.maskData.x - maskStartX - maskPosition.x : physicsX - maskPosition.x + diff
          const anchorY = startMaskCenterInRect.y / this.startData.height

          result = {
            x: newRectLeftTop.x - diffMaskX,
            y: newRectLeftTop.y - diffH * anchorY,
            width,
            height
          }
          break
        }
        case POSITION.bottomCenter: {
          const maskHeightDiff = y > 0 ? startRectRightBottom.y - startMaskRigthBottom.y : startMaskLeftTop.y - startRectLeftTop.y
          const startHeightRate = this.startData.height / (this.maskData.height + maskHeightDiff)

          const height = maskPosition.height * startHeightRate
          const width = height / startRectSizeRate
          const diffW = width - this.startData.width

          // y 的距离也是需要同比例增大
          const rateW = height / this.startData.height
          const maskStartY = this.maskData.y - newRectLeftTop.y
          const diffMaskY = y > 0 ? this.maskData.y * rateW - this.maskData.y : this.maskData.y - maskStartY - maskPosition.y

          const anctorX = startMaskCenterInRect.x / this.startData.width

          result = {
            x: newRectLeftTop.x - diffW * anctorX,
            y: newRectLeftTop.y - diffMaskY,
            height,
            width
          }
          break
        }

        case POSITION.topCenter: {
          const maskHeightDiff = y > 0 ? startMaskLeftTop.y - startRectLeftTop.y : startRectRightBottom.y - startMaskRigthBottom.y
          const startHeightRate = this.startData.height / (this.maskData.height + maskHeightDiff)
          const height = maskPosition.height * startHeightRate
          const width = height / startRectSizeRate
          const diffW = width - this.startData.width

          const diff = startRectRightBottom.y - startMaskRigthBottom.y
          // mask 的开始坐标，应该是和rect 的x 重合的时候。 
          const maskStartY = this.maskData.y - newRectLeftTop.y
          const diffMaskY = y > 0 ? this.maskData.y - maskStartY - maskPosition.y : physicsY - maskPosition.y + diff

          const anctorX = startMaskCenterInRect.x / this.startData.width

          result = {
            x: newRectLeftTop.x - diffW * anctorX,
            y: newRectLeftTop.y - diffMaskY,
            height,
            width
          }
          break
        }
      }
    }
    return result
  }

  //4： mask 超出了 rect 的范围 ，计算rect 的位置 
  toRectPosition (maskPosition, newRectLeftTop, type) {
    let result
    const centerPonintList = [POSITION.topCenter, POSITION.rightCenter, POSITION.bottomCenter, POSITION.leftCenter]
    if (centerPonintList.includes(type)) {
      result = this.dragCenterPoint(maskPosition, newRectLeftTop, type)
    } else {
      // 拖拽四个顶点
      result = this.dragAroundPoint(maskPosition, newRectLeftTop, type)
    }
    return result
  }

  //5： 计算 mask 在rect 中的位置
  toMaskOpsitionInRect (maskData, rectData) {
    return {
      x: maskData.x - rectData.x,
      y: maskData.y - rectData.y,
      width: maskData.width,
      height: maskData.height,
    }
  }
}

//  实现思路：
/**
 * 1、mask 就沿用之前的老方法做拉伸，基准点=>画布
 * 2、mask 发生了变化，中心点也就发生了变化，重新计算rect 的坐标  =>   公式？
 * 3、判断 mask 是否在rect 的内部    => 公式？
 * 4、不在rect内部，就计算 rect 位置和大小  => 公式？
 * 5、转换 mask 在rect中的位置  => 公式？
 */

