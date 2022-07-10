import { deepCopy, getRectRotatedRange, uniqAlignLines, calcRotatedPoint, getMiddlePoint } from './helper'
import { POSITION, ALIGNMENT_TYPE } from '../constants';


// 画布大小
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800

// 吸附距离
const SORPTION_RANGE = 5

export default class ScaleAlignmentLinesHandler {
  constructor(elementList, selectedIds, rotate, type) {
    this.elementList = elementList
    this.selectedList = deepCopy(this.initSelectedEle(selectedIds))
    // this.multipleData = { ...multipleData } multipleData
    this.selectedIds = selectedIds
    this.rotate = rotate
    this.type = type
    this.lines = [] // 横轴
    this.init()
  }

  init () {
    this.elementList.forEach(ele => {
      if (!this.selectedIds.includes(ele.id)) {
        const { x, y, mask, rotate } = ele

        const { xRange, yRange } = getRectRotatedRange({
          rotate,
          x: x + mask.x,
          y: y + mask.y,
          width: mask.width,
          height: mask.height
        })

        const leftTop = {
          x: xRange[0],
          y: yRange[0]
        }

        const rightBottom = {
          x: xRange[1],
          y: yRange[1]
        }

        const width = rightBottom.x - leftTop.x
        const height = rightBottom.y - leftTop.y

        const center = {
          x: leftTop.x + width / 2,
          y: leftTop.y + height / 2
        }

        const topLine = { type: ALIGNMENT_TYPE.horizontal, value: leftTop.y, range: [leftTop.x, rightBottom.x] }
        const bottomLine = { type: ALIGNMENT_TYPE.horizontal, value: rightBottom.y, range: [leftTop.x, rightBottom.x] }
        const horizontalCenterLine = { type: ALIGNMENT_TYPE.horizontal, value: center.y, range: [leftTop.x, rightBottom.x] }
        const leftLine = { type: ALIGNMENT_TYPE.vertical, value: leftTop.x, range: [leftTop.y, rightBottom.y] }
        const rightLine = { type: ALIGNMENT_TYPE.vertical, value: rightBottom.x, range: [leftTop.y, rightBottom.y] }
        const verticalCenterLine = { type: ALIGNMENT_TYPE.vertical, value: center.x, range: [leftTop.y, rightBottom.y] }
        this.lines.push(topLine, bottomLine, horizontalCenterLine, leftLine, rightLine, verticalCenterLine)

      }
    });

    // 画布可视区域的四个边界、水平中心、垂直中心
    const edgeTopLine = { type: ALIGNMENT_TYPE.horizontal, value: 0, range: [0, CANVAS_WIDTH] }
    const edgeBottomLine = { type: ALIGNMENT_TYPE.horizontal, value: CANVAS_HEIGHT, range: [0, CANVAS_WIDTH] }
    const edgeHorizontalCenterLine = { type: ALIGNMENT_TYPE.horizontal, value: CANVAS_HEIGHT / 2, range: [0, CANVAS_WIDTH] }
    const edgeLeftLine = { type: ALIGNMENT_TYPE.vertical, value: 0, range: [0, CANVAS_HEIGHT] }
    const edgeRightLine = { type: ALIGNMENT_TYPE.vertical, value: CANVAS_WIDTH, range: [0, CANVAS_HEIGHT] }
    const edgeVerticalCenterLine = { type: ALIGNMENT_TYPE.vertical, value: CANVAS_WIDTH / 2, range: [0, CANVAS_HEIGHT] }
    this.lines.push(edgeTopLine, edgeBottomLine, edgeHorizontalCenterLine, edgeLeftLine, edgeRightLine, edgeVerticalCenterLine)

    // 去重
    this.lines = uniqAlignLines(this.lines)
  }

  initSelectedEle (selectedIds) {
    return this.elementList.filter((item) => selectedIds.includes(item.id))
  }

  isMultiple () {
    return this.selectedIds.length > 1
  }

  calcHandler (mousePosition, sPoint) {
    // 拉伸辅助线只有一个，x和y不可能同时出现
    let result = {}
    // 暂且只做一个点
    let pointY = mousePosition.y
    let pointX = mousePosition.x
    // 一个满足要求即可，some可以中断循环
    this.lines.some(({ value, range, type }) => {
      const isHorizontal = type === ALIGNMENT_TYPE.horizontal
      const diff = isHorizontal ? Math.abs(pointY - value) : Math.abs(pointX - value)
      if (diff < SORPTION_RANGE) {
        let start = sPoint
        let end = mousePosition
        const adsorbentPoint = this.getAdsorbentPoint(start, end, isHorizontal, value)
        const { x, y, width, height } = this.getRectData(adsorbentPoint, sPoint)
        const { xRange, yRange } = getRectRotatedRange({
          rotate: this.rotate,
          x,
          y,
          width,
          height
        })
        const rectRange = isHorizontal ? xRange : yRange
        const min = Math.min(...range, ...rectRange)
        const max = Math.max(...range, ...rectRange)
        result = {
          alignmentLines: [{ type, axis: { x: isHorizontal ? min : value, y: isHorizontal ? value : min }, length: max - min }],
          x,
          y,
          width,
          height
        }
        return true
      }
      return false
    })

    return result
  }

  // 直线方程公式 y1 - y2 = k(x1 - x2)
  getAdsorbentPoint (a, b, isHorizontal, value) {
    // 斜率
    const k = (b.y - a.y) / (b.x - a.x)

    if (isHorizontal) {
      return {
        y: value,
        x: (k * a.x - a.y + value) / k
      }
    }
    return {
      x: value,
      y: -(k * (a.x - value) - a.y)
    }
  }

  getRectData (adsorbentPoint, DiagonalPOint) {
    // 计算出非旋转的吸附点，和对角点
    const center = getMiddlePoint(adsorbentPoint, DiagonalPOint);
    const newAdsorbentPoint = calcRotatedPoint(adsorbentPoint, center, -this.rotate);
    const newDiagonalPoint = calcRotatedPoint(DiagonalPOint, center, -this.rotate);
    switch (this.type) {
      case POSITION.leftTop: {
        return {
          x: newAdsorbentPoint.x,
          y: newAdsorbentPoint.y,
          width: newDiagonalPoint.x - newAdsorbentPoint.x,
          height: newDiagonalPoint.y - newAdsorbentPoint.y,
        }
      }
      case POSITION.leftBottom: {
        return {
          x: newAdsorbentPoint.x,
          y: newDiagonalPoint.y,
          width: newDiagonalPoint.x - newAdsorbentPoint.x,
          height: newAdsorbentPoint.y - newDiagonalPoint.y
        }
      }
      case POSITION.rightTop: {
        return {
          x: newDiagonalPoint.x,
          y: newAdsorbentPoint.y,
          width: newAdsorbentPoint.x - newDiagonalPoint.x,
          height: newDiagonalPoint.y - newAdsorbentPoint.y
        }
      }
      case POSITION.rightBottom: {
        return {
          x: newDiagonalPoint.x,
          y: newDiagonalPoint.y,
          width: newAdsorbentPoint.x - newDiagonalPoint.x,
          height: newAdsorbentPoint.y - newDiagonalPoint.ys
        }
      }
    }
  }

}