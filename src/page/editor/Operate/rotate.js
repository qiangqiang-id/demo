export default class RotateHandler {
  constructor(initData) {
    this.initData = initData

  }
  rotateHandler (mousePosition) {
    const { startY, startX, centerY, centerX, startRotate } = this.initData
    // 旋转前的角度
    const rotateDegreeBefore =
      Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180);
    // 旋转后的角度
    const rotateDegreeAfter =
      Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX) / (Math.PI / 180);
    // 获取旋转的角度值， startRotate 为初始角度值
    return rotateDegreeAfter - rotateDegreeBefore + startRotate;
  } 
}