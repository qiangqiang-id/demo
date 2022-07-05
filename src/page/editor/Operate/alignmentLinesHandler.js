import { uniqAlignLines, deepCopy, getRectRotatedRange } from './helper'

// 画布大小
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 800

// 吸附距离
const SORPTION_RANGE = 5

export default class AlignmentLinesHandler {
  constructor(elementList, selectedIds) {
    this.elementList = elementList
    this.selectedList = deepCopy(this.initSelectedEle(selectedIds))
    this.selectedIds = selectedIds
    this.horizontalLines = [] // 横轴
    this.verticalLines = [] // 纵轴
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

        const center = {
          x: leftTop.x + mask.width / 2,
          y: leftTop.y + mask.height / 2
        }


        const topLine = { value: leftTop.y, range: [leftTop.x, rightBottom.x] }
        const bottomLine = { value: rightBottom.y, range: [leftTop.x, rightBottom.x] }
        const horizontalCenterLine = { value: center.y, range: [leftTop.x, rightBottom.x] }

        const leftLine = { value: leftTop.x, range: [leftTop.y, rightBottom.y] }
        const rightLine = { value: rightBottom.x, range: [leftTop.y, rightBottom.y] }
        const verticalCenterLine = { value: center.x, range: [leftTop.y, rightBottom.y] }

        this.horizontalLines.push(topLine, bottomLine, horizontalCenterLine)
        this.verticalLines.push(leftLine, rightLine, verticalCenterLine)

        // 画布可视区域的四个边界、水平中心、垂直中心
        const edgeTopLine = { value: 0, range: [0, CANVAS_WIDTH] }
        const edgeBottomLine = { value: CANVAS_HEIGHT, range: [0, CANVAS_WIDTH] }
        const edgeHorizontalCenterLine = { value: CANVAS_HEIGHT / 2, range: [0, CANVAS_WIDTH] }
        const edgeLeftLine = { value: 0, range: [0, CANVAS_HEIGHT] }
        const edgeRightLine = { value: CANVAS_WIDTH, range: [0, CANVAS_HEIGHT] }
        const edgeVerticalCenterLine = { value: CANVAS_WIDTH / 2, range: [0, CANVAS_HEIGHT] }
        this.horizontalLines.push(edgeTopLine, edgeBottomLine, edgeHorizontalCenterLine)
        this.verticalLines.push(edgeLeftLine, edgeRightLine, edgeVerticalCenterLine)
        // 去重
        this.horizontalLines = uniqAlignLines(this.horizontalLines)
        this.verticalLines = uniqAlignLines(this.verticalLines)
      }
    });

  }


  initSelectedEle (selectedIds) {
    return this.elementList.filter((item) => selectedIds.includes(item.id))
  }

  calcHandler (moveDistance) {
    const _alignmentLines = []
    let isVerticalAdsorbed = false
    let isHorizontalAdsorbed = false

    // todo：暂时默认第一个
    const target = this.selectedList[0]
    const { x, y, mask, rotate } = target
    const { xRange, yRange } = getRectRotatedRange({
      rotate,
      x: x + mask.x + moveDistance.x,
      y: y + mask.y + moveDistance.y,
      width: mask.width,
      height: mask.height
    })

    const targetMinAxis = {
      x: xRange[0],
      y: yRange[0],
    }
    const targetMaxAxis = {
      x: xRange[1],
      y: yRange[1],
    }

    const targetCenter = {
      x: targetMinAxis.x + mask.width / 2,
      y: targetMinAxis.y + mask.height / 2,
    }

    let targetTop = y + moveDistance.y
    let targetLeft = x + moveDistance.x

    for (let i = 0; i < this.horizontalLines.length; i++) {
      const { value, range } = this.horizontalLines[i]
      const min = Math.min(...range, targetMinAxis.x, targetMaxAxis.x)
      const max = Math.max(...range, targetMinAxis.x, targetMaxAxis.x)

      if (Math.abs(targetMinAxis.y - value) < SORPTION_RANGE && !isHorizontalAdsorbed) {
        targetTop = targetTop - (targetMinAxis.y - value)
        isHorizontalAdsorbed = true
        _alignmentLines.push({ type: 'horizontal', axis: { x: min, y: value }, length: max - min })
      }

      if (Math.abs(targetMaxAxis.y - value) < SORPTION_RANGE && !isHorizontalAdsorbed) {
        targetTop = targetTop - (targetMaxAxis.y - value)
        isHorizontalAdsorbed = true
        _alignmentLines.push({ type: 'horizontal', axis: { x: min, y: value }, length: max - min })

      }

      if (Math.abs(targetCenter.y - value) < SORPTION_RANGE && !isHorizontalAdsorbed) {
        targetTop = targetTop - (targetCenter.y - value)
        isHorizontalAdsorbed = true
        _alignmentLines.push({ type: 'horizontal', axis: { x: min, y: value }, length: max - min })
      }
    }

    for (let i = 0; i < this.verticalLines.length; i++) {
      const { value, range } = this.verticalLines[i]
      const min = Math.min(...range, targetMinAxis.y, targetMaxAxis.y)
      const max = Math.max(...range, targetMinAxis.y, targetMaxAxis.y)

      if (Math.abs(targetMinAxis.x - value) < SORPTION_RANGE && !isVerticalAdsorbed) {
        targetLeft = targetLeft - (targetMinAxis.x - value)
        isVerticalAdsorbed = true
        _alignmentLines.push({ type: 'vertical', axis: { x: value, y: min }, length: max - min })
      }
      if (Math.abs(targetMaxAxis.x - value) < SORPTION_RANGE && !isVerticalAdsorbed) {
        targetLeft = targetLeft - (targetMaxAxis.x - value)
        isVerticalAdsorbed = true
        _alignmentLines.push({ type: 'vertical', axis: { x: value, y: min }, length: max - min })
      }
      if (Math.abs(targetCenter.x - value) < SORPTION_RANGE && !isVerticalAdsorbed) {
        targetLeft = targetLeft - (targetCenter.x - value)
        isVerticalAdsorbed = true
        _alignmentLines.push({ type: 'vertical', axis: { x: value, y: min }, length: max - min })
      }
    }

    return {
      alignmentLines: _alignmentLines,
      targetTop,
      targetLeft
    }
  }
}