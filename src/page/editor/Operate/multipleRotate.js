import { deepCopy ,calcRotatedPoint} from './helper'

export default class MultipleRotate {
  constructor(selectedList, rectData,rectStartRotate) {
    this.selectedList = deepCopy(selectedList)
    this.rectData = deepCopy(rectData)
    this.rectStartRotate = rectStartRotate
  }

  handleRotate (currentRotate) {
    const result = []

    this.selectedList.forEach((item) => {
      const { x, y, width, height, rotate, id, anchor} = item;

      const startTopLeft = {
        x: x,
        y: y,
      }
      
      const startCenter = {
        x: startTopLeft.x + width * anchor.x,
        y: startTopLeft.y + height * anchor.y,
      }

      const rectCenter = {
        x: this.rectData.x + this.rectData.width / 2,
        y: this.rectData.y + this.rectData.height / 2,
      }
      const diffRotate = currentRotate - this.rectStartRotate

      const newRotate = rotate + diffRotate

      const newCenter = calcRotatedPoint(startCenter, rectCenter, diffRotate)
      
      const currentTopLeft = {
        x: newCenter.x - width * anchor.x,
        y: newCenter.y - height * anchor.y
      }

      result.push({
        id,
        rotate: newRotate,
        ...currentTopLeft
      })

    })
    return result
  }
}

/**
 * 实现思路：将元素的中心点，通过多选框的中心点进行角度偏移，计算出新的中心点，再计算左上角
 */