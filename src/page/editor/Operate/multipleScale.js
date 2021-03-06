import { deepCopy, calcRotatedPoint } from './helper'
import ScaleHandler from './scale'
import { POSITION } from '../constants';

export default class MultipleScale {

  constructor(rectData, type, selectedList, rotate, selectedIds) {
    this.startRectData = deepCopy(rectData)
    this.type = type
    this.selectedList = deepCopy(selectedList)
    this.scaleHandler = new ScaleHandler(rotate, type, this.startRectData, {
      minWidth: 50,
      minHeight: 50,
      isLockProportions: true,
    }, selectedIds);
    this.rotate = rotate

  }

  handlerScale (mousePosition) {
    const newRectData = this.scaleHandler.handlerScale(mousePosition)
    // 拉伸比例
    const rateW = newRectData.width / this.startRectData.width
    const rateH = newRectData.height / this.startRectData.height
    // 拖拽点的对顶点物理坐标
    const rectVerticesPhysics = this.getVerticesPhysics()
    const result = []
    this.selectedList.forEach((item) => {
      const { x: startX, y: startY, mask: startMask, width: startW, height: startH, id } = item
      // mask以画布为基准的位置
      const xMaskStratInCanvas = startX + startMask.x
      const yMaskStratInCanvas = startY + startMask.y

      // 原图大小
      const width = startW * rateW;
      const height = startH * rateH;
      // mask 大小
      const maskW = startMask.width * rateW
      const maskH = startMask.height * rateH
      // mask 在 原图的定位的增长距离
      const diffMaskX = startMask.x * rateW - startMask.x;
      const diffMaskY = startMask.y * rateH - startMask.y;
      // 缩放基础距离
      const xMaskStartInRect = rectVerticesPhysics.x - xMaskStratInCanvas
      const yMaskStartInRect = rectVerticesPhysics.y - yMaskStratInCanvas
      // 元素位置
      const rectX = rectVerticesPhysics.x - xMaskStartInRect * rateW
      const rectY = rectVerticesPhysics.y - yMaskStartInRect * rateH

      result.push({
        id,
        width,
        height,
        x: rectX - startMask.x - diffMaskX,
        y: rectY - startMask.y - diffMaskY,
        mask: {
          width: maskW,
          height: maskH,
          x: startMask.x + diffMaskX,
          y: startMask.y + diffMaskY
        }
      })
    });
    const data = {
      x: newRectData.x,
      y: newRectData.y,
      width: newRectData.width,
      height: newRectData.height,
    }

    return {
      list: result,
      data,
      alignmentLines: newRectData.alignmentLines || []
    }
  }

  getVerticesPhysics () {
    const { x, y, width, height } = this.startRectData
    const center = {
      x: x + width / 2,
      y: y + height / 2,
    }
    switch (this.type) {
      case POSITION.leftTop: {
        const rightBottom = {
          x: x + width,
          y: y + height
        }
        return calcRotatedPoint(rightBottom, center, this.rotate)
      }

      case POSITION.rightBottom: {
        const leftTop = {
          x,
          y
        }
        return calcRotatedPoint(leftTop, center, this.rotate)
      }

      case POSITION.leftBottom: {
        const rightTop = {
          x: x + width,
          y
        }
        return calcRotatedPoint(rightTop, center, this.rotate)
      }

      case POSITION.rightTop: {
        const leftBottom = {
          x,
          y: y + height
        }
        return calcRotatedPoint(leftBottom, center, this.rotate)
      }
    }
  }
}