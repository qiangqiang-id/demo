import { deepCopy } from './helper'
import { calcRotatedPoint } from './drag'

export default class MultipleScale {
  constructor(selectedList, rectData,rectStartRotate) {
    this.selectedList = deepCopy(selectedList)
    this.rectData = deepCopy(rectData)
    this.rectStartRotate = rectStartRotate
  }

  handleRotate (currentRotate) {
    const result = []

    this.selectedList.forEach((item) => {
      const { x, y, mask, rotate, id } = item;

      const startTopLeft = {
        x: x + mask.x,
        y: y + mask.y,
      }
      
      const startCenter = {
        x: startTopLeft.x + mask.width / 2,
        y: startTopLeft.y + mask.height / 2,
      }

      const rectCenter = {
        x: this.rectData.x + this.rectData.width / 2,
        y: this.rectData.y + this.rectData.height / 2,
      }
      const diffRotate = (currentRotate - this.rectStartRotate)
      const newRotate = rotate + diffRotate

      // 开始的物理位置
      const startTopLeftP = calcRotatedPoint(startTopLeft, startCenter, rotate)
      // 旋转中的物理位置
      const currentTopLeftP = calcRotatedPoint(startTopLeftP, rectCenter, diffRotate)
      // 旋转的中的中心点物理位置
      const currentCentert = calcRotatedPoint(startCenter, rectCenter, diffRotate)
      // 旋转的中回正位置 
      const currentTopLeft = calcRotatedPoint(currentTopLeftP, currentCentert, -newRotate)
      result.push({
        id,
        rotate: newRotate,
        ...currentTopLeft
      })

    })
    return result
  }
}