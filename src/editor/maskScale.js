
import { ScaleHandler, calcRotatedPoint } from './drag'
import { POSITION } from './constants';

export class MaskScale {
  constructor(containerStartData, type) {
    // 父容器的开始位置
    this.startData = { ...containerStartData, }
    this.maskData = { ...containerStartData.mask }
    this.positionType = type
    this.scaleHandler = new ScaleHandler(containerStartData, type, this.getMaskInEditerAreaPosition())
    this.rectPosition = this.init(containerStartData)
  }

  // 获取mask 在 画布中的 位置
  getMaskInEditerAreaPosition () {
    const data = this.startData
    const mask = this.startData.mask
    return {
      x: data.x + mask.x,
      y: data.y + mask.y,
      width: mask.width,
      height: mask.height
    }
  }

  // 根据开始位置，旋转后的左上角的位置
  init (data) {
    const { x, y, mask } = this.startData
    const startCenterPoint = {
      x: x + mask.x + mask.width / 2,
      y: y + mask.y + mask.height / 2
    }
    // 根据开始位置，旋转后的左上角的位置
    const rotateLeftTop = calcRotatedPoint({ x: data.x, y: data.y }, startCenterPoint, this.startData.rotate)
    return rotateLeftTop
  }

  handleScale (mousePosition, type) {

    // mask 以画布为基础，做拖拽计算
    const poi = this.scaleHandler.getAroundScaleData(mousePosition)
    // 中心点发生变化重新计算rect 的位置 , 保证统一旋转点
    let rectData = this.resetToRectPosition(poi)
    // 监测mask 是否在rect 的内容，精度丢失需要处理
    rectData = this.toRectPosition(poi, rectData, type)
    // 滑动的过快，会导致更新不过来，手动回到原始大小
    const maskData = this.toMaskOpsitionInRect(poi, rectData)

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

    const data = {
      maskX: maskData.x,
      maskY: maskData.y,
      maskW: maskData.width,
      maskH: maskData.height,
      rectX: newLeftTop.x,
      rectY: newLeftTop.y,
      rectW: this.startData.width,
      rectH: this.startData.height,
    }
    // const list = ['maskX', 'maskY', 'rectX', 'rectY']
    if (isInt) {
      Object.keys(data).forEach((key) => {
        // if (list.includes(key)) {
        data[key] = this.keepDecimal(data[key], 0)
        // }
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
  isMaskInRect (maskData, newLeftTop) {
    // 存在精度丢失问题，暂时先换算成整数
    const { maskTopLeft, maskBottomRight, rectTopLeft, rectBottomRight } = this.getMaskAndRectPoint(maskData, newLeftTop, true)

    // 因为mask 和rect 的旋转点是相同的，所以可以这样比较
    return maskTopLeft[0] >= rectTopLeft[0] && maskTopLeft[1] >= rectTopLeft[1] && maskBottomRight[0] <= rectBottomRight[0] && maskBottomRight[1] <= rectBottomRight[1]
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
    // const maskRightBottomPoint = {
    //   x: maskPosition.x + maskPosition.width,
    //   y: maskPosition.y + maskPosition.height
    // }

    const rectRightBottomPoint = {
      x: newRectLeftTop.x + this.startData.width,
      y: newRectLeftTop.y + this.startData.height
    }

    // const maskLeftTopPoint = {
    //   x: maskPosition.x,
    //   y: maskPosition.y
    // }

    const rectLeftTopPoint = {
      x: newRectLeftTop.x,
      y: newRectLeftTop.y,
    }


    // const dragRightCenter = () => {

    //   const diffW = maskRightBottomPoint.x - rectRightBottomPoint.x
    //   const width = this.startData.width + diffW
    //   const rate = width / this.startData.width
    //   const height = this.startData.height * rate
    //   const diffH = height - this.startData.height
    //   return {
    //     x: newRectLeftTop.x,
    //     y: newRectLeftTop.y - diffH / 2,
    //     width,
    //     height
    //   }

    // }

    // const dragLeftCenter = () => {
    //   const diffW = rectLeftTopPoint.x - maskLeftTopPoint.x
    //   const width = this.startData.width + diffW
    //   const rate = width / this.startData.width
    //   const height = this.startData.height * rate
    //   const diffH = height - this.startData.height
    //   return {
    //     y: newRectLeftTop.y - diffH / 2,
    //     x: newRectLeftTop.x - diffW,
    //     width,
    //     height

    //   }
    // }

    // const dragBottomCenter = () => {
    //   const height = this.startData.height + maskRightBottomPoint.y - rectRightBottomPoint.y
    //   const rate = height / this.startData.height
    //   const width = this.startData.width * rate
    //   const diffW = width - this.startData.width
    //   return {
    //     x: newRectLeftTop.x - diffW / 2,
    //     y: newRectLeftTop.y,
    //     height,
    //     width
    //   }
    // }

    // const dragTopCenter = () => {
    //   const diffH = rectLeftTopPoint.y - maskLeftTopPoint.y
    //   const height = this.startData.height + diffH
    //   const rate = height / this.startData.height
    //   const width = this.startData.width * rate
    //   const diffW = width - this.startData.width
    //   return {
    //     x: newRectLeftTop.x - diffW / 2,
    //     y: newRectLeftTop.y - diffH,
    //     height,
    //     width
    //   }
    // }

    const isMaskInRect = this.isMaskInRect(maskPosition, newRectLeftTop)
    if (isMaskInRect) {
      // const { x, y } = this.startData.scale

      // 滑动的过快，会导致更新不过来，手动回到原始大小
      result = {
        width: this.startData.width,
        height: this.startData.height,
        x: newRectLeftTop.x,
        y: newRectLeftTop.y
      }
    } else {
      const maskOriginRigthBottom = {
        x: this.startData.x + this.maskData.x + this.maskData.width,
        y: this.startData.y + this.maskData.y + this.maskData.height
      }
      const maskOriginLeftTop = {
        x: this.startData.x + this.maskData.x,
        y: this.startData.y + this.maskData.y
      }

      const startRectSizeRate = this.startData.height / this.startData.width

      switch (type) {
        case POSITION.rightCenter: {
          // mask 和 rect 同比例缩放 
          const maskWidthDiff = rectRightBottomPoint.x - maskOriginRigthBottom.x
          const startWidthRate = this.startData.width / (this.maskData.width + maskWidthDiff)
          const width = maskPosition.width * startWidthRate
          const height = width * startRectSizeRate
          const diffH = height - this.startData.height

          // x 的距离也是需要同比例增大
          const rateW = width / this.startData.width
          const diffMaskX = this.maskData.x * rateW - this.maskData.x


          const maskCenterY = this.maskData.y + this.maskData.height / 2
          const anchorY = maskCenterY / this.startData.height

          result = {
            x: newRectLeftTop.x - diffMaskX,
            y: newRectLeftTop.y - diffH * anchorY,
            width,
            height
          }
          break;
        }
        case POSITION.leftCenter: {
          const maskWidthDiff = maskOriginLeftTop.x - rectLeftTopPoint.x
          const startWidthRate = this.startData.width / (this.maskData.width + maskWidthDiff)

          const width = maskPosition.width * startWidthRate
          const height = width * startRectSizeRate
          const diffH = height - this.startData.height

          // mask 的开始坐标，应该是和rect 的x 重合的时候。 
          const maskStartX = this.maskData.x - this.startData.x
          const diffMaskX = this.maskData.x - maskStartX - maskPosition.x

          const maskCenterY = this.maskData.y + this.maskData.height / 2
          const anchorY = maskCenterY / this.startData.height

          result = {
            x: newRectLeftTop.x - diffMaskX,
            y: newRectLeftTop.y - diffH * anchorY,
            width,
            height
          }
          break
        }
        case POSITION.bottomCenter: {
          // result = dragBottomCenter()
          const maskHeightDiff = rectRightBottomPoint.y - maskOriginRigthBottom.y
          const startHeightRate = this.startData.height / (this.maskData.height + maskHeightDiff)

          const height = maskPosition.height * startHeightRate
          const width = height / startRectSizeRate
          const diffW = width - this.startData.width

          // y 的距离也是需要同比例增大
          const rateW = height / this.startData.height
          const diffMaskY = this.maskData.y * rateW - this.maskData.y

          const maskCenterX = this.maskData.x + this.maskData.width / 2
          const anctorX = maskCenterX / this.startData.width

          result = {
            x: newRectLeftTop.x - diffW * anctorX,
            y: newRectLeftTop.y - diffMaskY,
            height,
            width
          }
          break
        }
        case POSITION.topCenter: {
          // result = dragTopCenter()
          const maskHeightDiff = maskOriginLeftTop.y - rectLeftTopPoint.y
          const startHeightRate = this.startData.height / (this.maskData.height + maskHeightDiff)
          const height = maskPosition.height * startHeightRate
          const width = height / startRectSizeRate
          const diffW = width - this.startData.width

          // mask 的开始坐标，应该是和rect 的x 重合的时候。 
          const maskStartY = this.maskData.y - this.startData.y
          const diffMaskY = this.maskData.y - maskStartY - maskPosition.y

          const maskCenterX = this.maskData.x + this.maskData.width / 2
          const anctorX = maskCenterX / this.startData.width

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
    let result, data
    const centerPonintList = [POSITION.topCenter, POSITION.rightCenter, POSITION.bottomCenter, POSITION.leftCenter]
    if (centerPonintList.includes(type)) {
      data = this.dragCenterPoint(maskPosition, newRectLeftTop, type)
    } else {
      // 拖拽四个顶点
      data = this.dragAroundPoint(maskPosition, newRectLeftTop, type)
    }
    if (data) result = data
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





