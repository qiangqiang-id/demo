


const POSITION = {
  leftTop: "leftTop",
  leftBottom: "leftBottom",
  rightTop: "rightTop",
  rightBottom: "rightBottom",
  topCenter: "topCenter",
  bottomCenter: "bottomCenter",
  leftCenter: "leftCenter",
  rightCenter: 'rightCenter',
  rotate: "rotate",
};



/**
 * 封装drag事件
 **/
export const dragAction = (oldEvent, executors) => {
  let cache = {}
  cache = executors.init(oldEvent)
  const startMove = (newEvent) => {
    cache = executors.move(newEvent, cache) || cache
  }

  const endMove = () => {
    executors.end()
    document.removeEventListener('mousemove', startMove)
    document.removeEventListener('mouseup', endMove)
  }

  document.addEventListener('mousemove', startMove)
  document.addEventListener('mouseup', endMove)
}

const getMiddlePoint = (prev, now) => {
  return {
    x: prev.x + ((now.x - prev.x) / 2),
    y: prev.y + ((now.y - prev.y) / 2)
  }
}

/**
 * 计算出圆心旋转后点的坐标
 * @param prev 旋转前的点坐标
 * @param center 旋转中心
 * @param angle 旋转的角度
 * @return 旋转后的坐标
 */
export const calcRotatedPoint = (prev, center, angle) => {
  angle /= 180 / Math.PI
  return {
    x: (prev.x - center.x) * Math.cos(angle) - (prev.y - center.y) * Math.sin(angle) + center.x,
    y: (prev.x - center.x) * Math.sin(angle) + (prev.y - center.y) * Math.cos(angle) + center.y
  }
}

/**
 * 检测 p0 是否在 p1 与 p2 建立的矩形内
 * @param  {Object}  p0 被检测的坐标
 * @param  {Object}  p1 点1坐标
 * @param  {Object}  p2 点2坐标
 * @return {Boolean}    检测结果
 */
const pointInRect = (p0, p1, p2) => {
  if (p1.x > p2.x) {
    if (p0.x < p2.x) {
      return false
    }
  } else {
    if (p0.x > p2.x) {
      return false
    }
  }

  if (p1.y > p2.y) {
    if (p0.y < p2.y) {
      return false
    }
  } else {
    if (p0.y > p2.y) {
      return false
    }
  }

  return true
}



export class ScaleHandler {

  constructor(data, position, isUseMaskData = false) {
    this.data = data
    this.position = position
    this.isLockProportions = true
    this.angle = data.rotate
    this.isUseMaskData = isUseMaskData
    this.operationData = this.getOperationData()
  }

  getOperationData () {

    let result = {}
    if (this.isUseMaskData) {
      result = { ...this.data.mask }
    } else {
      const { x, y, width, height, anchor } = this.data
      result = {
        x, y, width, height, anchor
      }
    }
    return result

  }

  // 获取拉四个角度的位置数据
  getAroundScaleData (mousePosition) {


    const { sPoint, proportion, handlePoint } = this.getKeyVariable()
    const { x, y, width, height, anchor } = this.getOperationData()

    switch (this.position) {
      case POSITION.leftTop: {
        // 中心点坐标
        let newCenterPoint = getMiddlePoint(mousePosition, sPoint);
        // 旋转后的topleft
        let newTopLeftPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle);
        // 旋转后的bottomRight
        let newBottomRightPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle);


        let newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
        let newHeight = newBottomRightPoint.y - newTopLeftPoint.y;

        if (this.isLockProportions) {
          // proportion move 前的拖放比例
          // 修正 坐标 宽高
          if (newWidth / newHeight > proportion) {
            newTopLeftPoint.x =
              newTopLeftPoint.x +
              Math.abs(newWidth - newHeight * proportion);
            newWidth = newHeight * proportion;
          } else {
            newTopLeftPoint.y =
              newTopLeftPoint.y +
              Math.abs(newHeight - newWidth / proportion);
            newHeight = newWidth / proportion;
          }

          // 重新计算 topLeft
          const rotatedTopLeftPoint = calcRotatedPoint(newTopLeftPoint, newCenterPoint, this.angle);

          // 中心点
          newCenterPoint = getMiddlePoint(rotatedTopLeftPoint, sPoint);
          newTopLeftPoint = calcRotatedPoint(rotatedTopLeftPoint, newCenterPoint, -this.angle);
          newBottomRightPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle);

          newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
          newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
        }

        if (newWidth < 20 || newHeight < 20) {
          return { width, height, x, y };

        }

        return {
          x: newTopLeftPoint.x + newWidth * anchor.x,
          y: newTopLeftPoint.y + newHeight * anchor.y,
          height: newHeight,
          width: newWidth,
        }
      }
      case POSITION.rightTop: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopRightPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)
        let newBottomLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)

        let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

        if (this.isLockProportions) {
          if (newWidth / newHeight > proportion) {
            newTopRightPoint.x = newTopRightPoint.x - Math.abs(newWidth - newHeight * proportion)
            newWidth = newHeight * proportion
          } else {
            newTopRightPoint.y = newTopRightPoint.y + Math.abs(newHeight - newWidth / proportion)
            newHeight = newWidth / proportion
          }

          const rotatedTopRightPoint = calcRotatedPoint(newTopRightPoint, newCenterPoint, this.angle)
          newCenterPoint = getMiddlePoint(rotatedTopRightPoint, sPoint)
          newTopRightPoint = calcRotatedPoint(rotatedTopRightPoint, newCenterPoint, -this.angle)
          newBottomLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)

          newWidth = newTopRightPoint.x - newBottomLeftPoint.x
          newHeight = newBottomLeftPoint.y - newTopRightPoint.y
        }

        if (newWidth < 20 || newHeight < 20) {
          return { width, height, x, y }
        }

        return {
          x: newBottomLeftPoint.x + newWidth * anchor.x,
          y: newTopRightPoint.y + newHeight * anchor.y,
          height: newHeight,
          width: newWidth
        }
      }

      case POSITION.leftBottom: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopRightPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)
        let newBottomLeftPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)

        let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

        if (this.isLockProportions) {
          if (newWidth / newHeight > proportion) {
            newBottomLeftPoint.x = newBottomLeftPoint.x + Math.abs(newWidth - newHeight * proportion)
            newWidth = newHeight * proportion
          } else {
            newBottomLeftPoint.y = newBottomLeftPoint.y - Math.abs(newHeight - newWidth / proportion)
            newHeight = newWidth / proportion
          }

          const rotatedBottomLeftPoint = calcRotatedPoint(newBottomLeftPoint, newCenterPoint, this.angle)
          newCenterPoint = getMiddlePoint(rotatedBottomLeftPoint, sPoint)
          newBottomLeftPoint = calcRotatedPoint(rotatedBottomLeftPoint, newCenterPoint, -this.angle)
          newTopRightPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)

          newWidth = newTopRightPoint.x - newBottomLeftPoint.x
          newHeight = newBottomLeftPoint.y - newTopRightPoint.y
        }

        if (newWidth < 20 || (newHeight < 20)) {
          return
        }

        return {
          x: newBottomLeftPoint.x + newWidth * anchor.x,
          y: newTopRightPoint.y + newHeight * anchor.y,
          height: newHeight,
          width: newWidth
        }
      }
      case POSITION.rightBottom: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)
        let newBottomRightPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)

        let newWidth = newBottomRightPoint.x - newTopLeftPoint.x
        let newHeight = newBottomRightPoint.y - newTopLeftPoint.y

        if (this.isLockProportions) {
          if (newWidth / newHeight > proportion) {
            newBottomRightPoint.x = newBottomRightPoint.x - Math.abs(newWidth - newHeight * proportion)
            newWidth = newHeight * proportion
          } else {
            newBottomRightPoint.y = newBottomRightPoint.y - Math.abs(newHeight - newWidth / proportion)
            newHeight = newWidth / proportion
          }

          const rotatedBottomRightPoint = calcRotatedPoint(newBottomRightPoint, newCenterPoint, this.angle)
          newCenterPoint = getMiddlePoint(rotatedBottomRightPoint, sPoint)
          newBottomRightPoint = calcRotatedPoint(rotatedBottomRightPoint, newCenterPoint, -this.angle)
          newTopLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)

          newWidth = newBottomRightPoint.x - newTopLeftPoint.x
          newHeight = newBottomRightPoint.y - newTopLeftPoint.y
        }

        if (newWidth < 20 || (newHeight < 20)) {
          return
        }

        console.log('x: %s,y: %s,width: %s, height: %s', newTopLeftPoint.x + newWidth * anchor.x, newTopLeftPoint.y + newHeight * anchor.y, newWidth, newHeight,)

        return {
          x: newTopLeftPoint.x + newWidth * anchor.x,
          y: newTopLeftPoint.y + newHeight * anchor.y,
          height: newHeight,
          width: newWidth
        }
      }

      case POSITION.bottomCenter:
      case POSITION.topCenter: {

        const rotatedCurrentPosition = calcRotatedPoint(mousePosition, handlePoint, -this.angle)

        const rotatedMiddlePoint = calcRotatedPoint(
          {
            x: handlePoint.x,
            y: rotatedCurrentPosition.y,
          },
          handlePoint,
          this.angle
        )

        const newHeight = Math.sqrt(
          Math.pow(rotatedMiddlePoint.x - sPoint.x, 2) + Math.pow(rotatedMiddlePoint.y - sPoint.y, 2)
        )

        const newCenter = {
          x:
            rotatedMiddlePoint.x -
            (Math.abs(sPoint.x - rotatedMiddlePoint.x) / 2) * (rotatedMiddlePoint.x > sPoint.x ? 1 : -1),
          y:
            rotatedMiddlePoint.y +
            (Math.abs(sPoint.y - rotatedMiddlePoint.y) / 2) * (rotatedMiddlePoint.y > sPoint.y ? -1 : 1),
        }


        if (!pointInRect(newCenter, handlePoint, sPoint) || newHeight < 10) {
          return {
            height,
            x,
            y
          }
        }

        return {
          height: newHeight,
          y: newCenter.y - newHeight / 2 + newHeight * anchor.y,
          x: newCenter.x - width / 2 + width * anchor.x,
        }

      }

      case POSITION.rightCenter:
      case POSITION.leftCenter: {

        const rotatedCurrentPosition = calcRotatedPoint(mousePosition, handlePoint, -this.angle)
        const rotatedMiddlePoint = calcRotatedPoint(
          {
            x: rotatedCurrentPosition.x,
            y: handlePoint.y
          },
          handlePoint,
          this.angle)

        const newWidth = Math.sqrt(Math.pow(rotatedMiddlePoint.x - sPoint.x, 2) + Math.pow(rotatedMiddlePoint.y - sPoint.y, 2))

        const newCenter = {
          x: rotatedMiddlePoint.x - (Math.abs(sPoint.x - rotatedMiddlePoint.x) / 2) * (rotatedMiddlePoint.x > sPoint.x ? 1 : -1),
          y: rotatedMiddlePoint.y + (Math.abs(sPoint.y - rotatedMiddlePoint.y) / 2) * (rotatedMiddlePoint.y > sPoint.y ? -1 : 1)
        }

        if (!pointInRect(newCenter, handlePoint, sPoint) || newWidth < 10) {
          return { width, x, y }
        }

        return {
          width: newWidth,
          y: newCenter.y - height / 2 + height * anchor.y,
          x: newCenter.x - newWidth / 2 + newWidth * anchor.x
        }
      }

    }
  }


  getKeyVariable () {



    const { x, y, width, height, anchor } = this.getOperationData()

    const center = {
      x: x + width / 2 - width * anchor.x,
      y: y + height / 2 - height * anchor.y,
    }

    const handlePoint = this.getPoint(center)

    const sPoint = {
      x: center.x + Math.abs(handlePoint.x - center.x) * (handlePoint.x < center.x ? 1 : -1),
      y: center.y + Math.abs(handlePoint.y - center.y) * (handlePoint.y < center.y ? 1 : -1),
    }

    return {
      center, // 元素原始中心点坐标
      handlePoint, // 当前拖动手柄的虚拟坐标（旋转后的坐标）
      sPoint, // 拖动手柄的对称点的坐标（假设拖动的是左上角手柄，那么他的对称点就是右下角的点）
      proportion: this.isLockProportions ? width / height : 1, // 宽高比
    }
  }

  // 获取当前拉动点的位置，拉动过程中可能存在旋转，旋转过的中心点是发生了位置变化的，需要做处理。
  getPoint (center) {
    let point;
    const { x, y, height, width, anchor } = this.getOperationData()


    // 手动调整x，y
    const toX = x - width * anchor.x
    const toY = y - height * anchor.y


    switch (this.position) {
      case POSITION.leftTop:
        point = {
          x: toX,
          y: toY,
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.topCenter:
        point = {
          x: toX + width / 2,
          y: toY
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.rightTop:
        point = {
          x: toX + width,
          y: toY,
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.leftBottom:
        point = {
          x: toX,
          y: toY + height,
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.bottomCenter:
        point = {
          x: toX + width / 2,
          y: toY + height
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.rightBottom:
        point = {
          x: toX + width,
          y: toY + height,
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.leftCenter:
        point = {
          x: toX,
          y: toY + height / 2
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
      case POSITION.rightCenter:
        point = {
          x: toX + width,
          y: center.y
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );

      default:
        point = {
          x: toX,
          y: toY,
        };
        return calcRotatedPoint(
          point,
          center,
          this.angle
        );
    }
  }

}



export class RotateHandler {
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