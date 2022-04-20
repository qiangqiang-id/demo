


import { ScaleHandler, calcRotatedPoint } from './drag'
// import { isCollision } from './helper'


let dom = null
let center = null

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


  handleScale (mousePosition,) {


    // mask 以画布为基础，做拖拽计算
    const poi = this.scaleHandler.getAroundScaleData(mousePosition)

    const newLeftTop = this.resetToRectPosition(poi)
    // 监测mask 是否在rect 的内部
    this.isMaskInRect(poi, newLeftTop)
    // console.log(bool)
    const maskData = this.toMaskOpsitionInRect(poi, newLeftTop)

    return {
      maskData,
      rectData: { ...newLeftTop }
    }

  }

  createDom (data, currentCenterPoint) {
    if (!dom) {
      // const editorArea = document.getElementById('editor-area')
      dom = document.createElement('div')

      Object.assign(dom.style, {
        position: 'absolute',
        width: this.startData.width + 'px',
        height: this.startData.height + 'px',
        top: data.y + 'px',
        left: data.x + 'px',
        transform: `rotate(${this.startData.rotate}deg)`,
        outline: '2px solid blue'
      })

      center = document.createElement('div')

      // editorArea.appendChild(dom)
      // editorArea.appendChild(center)
    }

    //  计算新的中心点
    const rateX = (currentCenterPoint.x - data.x) / this.startData.width
    const rateY = (currentCenterPoint.y - data.y) / this.startData.height

    Object.assign(dom.style, {
      left: data.x + 'px',
      top: data.y + 'px',
      transform: `rotate(${this.startData.rotate}deg)`,
      transformOrigin: `${rateX * 100}% ${rateY * 100}%`
    })


    Object.assign(center.style, {
      position: 'absolute',
      top: currentCenterPoint.y + 'px',
      left: currentCenterPoint.x + "px",
      width: 4 + 'px',
      height: 4 + 'px',
      borderRadius: '100%',
      background: 'red',
    })


  }

  //2： 中心点发生变化重新计算rect 的位置 , 保证统一旋转点
  resetToRectPosition (maskData) {

    const currentCenterPoint = {
      x: maskData.x + maskData.width / 2,
      y: maskData.y + maskData.height / 2
    }

    // 根据改变的中心点，计算出旋转的位置
    const newLeftTop = calcRotatedPoint({ x: this.rectPosition.x, y: this.rectPosition.y }, currentCenterPoint, -this.startData.rotate)
    this.createDom(newLeftTop, currentCenterPoint)

    return newLeftTop
  }

  keepDecimal (result, unit) {
    return Math.floor(result * Math.pow(10, unit)) / Math.pow(10, unit)
  }

  //3： 判断mask 是否在 rect 内部
  isMaskInRect (maskData, newLeftTop) {


    // 存在精度丢失问题，暂时先换算成整数
    const maskX = this.keepDecimal(maskData.x, 0)
    const maskY = this.keepDecimal(maskData.y, 0)
    const maskW = this.keepDecimal(maskData.width, 0)
    const maskH = this.keepDecimal(maskData.height, 0)
    const rectX = this.keepDecimal(newLeftTop.x, 0)
    const rectY = this.keepDecimal(newLeftTop.y, 0)
    const rectW = this.keepDecimal(this.startData.width, 0)
    const rectH = this.keepDecimal(this.startData.height, 0)


    const maskTopLeft = [maskX, maskY]
    const maskBottomRight = [maskX + maskW, maskY + maskH]

    const rectTopLeft = [rectX, rectY]
    const rectBottomRight = [rectX + rectW, rectY + rectH]


    // 因为mask 和rect 的旋转点是相同的，所以可以这样比较
    return maskTopLeft[0] >= rectTopLeft[0] && maskTopLeft[1] >= rectTopLeft[1] && maskBottomRight[0] <= rectBottomRight[0] && maskBottomRight[1] <= rectBottomRight[1]
  }

  //4： mask 超出了 rect 的范围 ，计算rect 的位置 
  toRectPosition () { }

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





