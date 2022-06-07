
import { POSITION } from './constants';
import { calcRotatedPoint, pointInRect, isCenterPoint } from './helper'


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

export class ScaleHandler {

  constructor(rotate, position, maskData, option) {
    this.data = maskData
    this.position = position
    this.option = option
    this.angle = rotate
  }


  handlerScale (mousePosition) {

    let result = {}
    const { sPoint, proportion, handlePoint } = this.getKeyVariable()
    const { x, y, width, height } = this.data


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

        if (this.option.isLockProportions) {
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


        result = {
          x: newTopLeftPoint.x,
          y: newTopLeftPoint.y,
          height: newHeight,
          width: newWidth,
        }
        break
      }
      case POSITION.rightTop: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopRightPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)
        let newBottomLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)

        let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

        if (this.option.isLockProportions) {
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
          // return { width, height, x, y }
          // 开始旋转后的坐标 对顶角
          const startRotatedBottomLeft = calcRotatedPoint({ x, y: y + height }, { x: x + width / 2, y: y + height / 2 }, this.angle)
          // 计算当前中心点位置
          const currentCenter = calcRotatedPoint({
            x: startRotatedBottomLeft.x + (newWidth < 20 ? 20 / 2 : newWidth / 2),
            y: startRotatedBottomLeft.y - (newHeight < 20 ? 20 / 2 : newHeight / 2),
          }, startRotatedBottomLeft, this.angle)

          const currentPoint = calcRotatedPoint(startRotatedBottomLeft, currentCenter, -this.angle)

          currentPoint.y -= newHeight < 20 ? 20 : newHeight

          result = {
            ...currentPoint,
            width: newWidth < 20 ? 20 : newWidth,
            height: newHeight < 20 ? 20 : newHeight,
          }

        }

        result = {
          x: newBottomLeftPoint.x,
          y: newTopRightPoint.y,
          height: newHeight,
          width: newWidth
        }
        break
      }

      case POSITION.leftBottom: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopRightPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)
        let newBottomLeftPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)

        let newWidth = newTopRightPoint.x - newBottomLeftPoint.x
        let newHeight = newBottomLeftPoint.y - newTopRightPoint.y

        if (this.option.isLockProportions) {
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

        result = {
          x: newBottomLeftPoint.x,
          y: newTopRightPoint.y,
          height: newHeight,
          width: newWidth
        }

        break
      }
      case POSITION.rightBottom: {

        let newCenterPoint = getMiddlePoint(mousePosition, sPoint)
        let newTopLeftPoint = calcRotatedPoint(sPoint, newCenterPoint, -this.angle)
        let newBottomRightPoint = calcRotatedPoint(mousePosition, newCenterPoint, -this.angle)

        let newWidth = newBottomRightPoint.x - newTopLeftPoint.x
        let newHeight = newBottomRightPoint.y - newTopLeftPoint.y

        if (this.option.isLockProportions) {
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

        result = {
          x: newTopLeftPoint.x,
          y: newTopLeftPoint.y,
          height: newHeight,
          width: newWidth
        }

        break
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

        result = {
          width,
          height: newHeight,
          y: newCenter.y - newHeight / 2,
          x: newCenter.x - width / 2,
        }
        break

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

        result = {
          height,
          width: newWidth,
          y: newCenter.y - height / 2,
          x: newCenter.x - newWidth / 2
        }
        break
      }

    }

    result = this.checkBoundary(result, handlePoint, sPoint)
    return result
  }


  getKeyVariable () {

    const { x, y, width, height } = this.data
    const center = {
      x: x + width / 2,
      y: y + height / 2,
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
      proportion: this.option.isLockProportions ? width / height : 1, // 宽高比
    }
  }

  // 获取当前拉动点的位置，拉动过程中可能存在旋转，旋转过的中心点是发生了位置变化的，需要做处理。
  getPoint (center) {
    let point;
    const { x, y, height, width } = this.data

    // 手动调整x，y
    const toX = x
    const toY = y


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
  // 检查边界值
  checkBoundary (result, handlePoint, sPoint) {
    let data = result
    const { maxHeight = Infinity, maxWidth = Infinity, minWidth = 20, minHeight = 20 } = this.option

    const { width, height, x, y } = result

    const newCenter = {
      x: x + width / 2,
      y: y + height / 2
    }


    if (!pointInRect(newCenter, handlePoint, sPoint) || maxHeight < height || maxWidth < width || minWidth > width || minHeight > height) {

      const { currentWidth:w, currentHeight:h } = this.getWidthAndHeightInBoundar(
        data,
        handlePoint,
        sPoint
      );

      const { x: startX, y: startY, width: startW, height: startH } = this.data

      const startCenter = {
        x: startX + startW / 2,
        y: startY + startH / 2,
      }

      switch (this.position) {
        case POSITION.leftTop: {
          const startRightBottomForRotated = calcRotatedPoint({
            x: startX + startW,
            y: startY + startH
          }, startCenter, this.angle)

          const currentCenter = calcRotatedPoint({
            x: startRightBottomForRotated.x - w / 2,
            y: startRightBottomForRotated.y - h / 2
          }, startRightBottomForRotated, this.angle)

          const currentRigthBottom = calcRotatedPoint(startRightBottomForRotated, currentCenter, -this.angle)
          currentRigthBottom.x -= w
          currentRigthBottom.y -= h

          data = {
            ...currentRigthBottom,
            width: w,
            height: h
          }
          break
        }

        case POSITION.rightBottom: {
          const startTopLeftForRotated = calcRotatedPoint({ x: startX, y: startY }, startCenter, this.angle)

          const currentCenter = calcRotatedPoint({
            x: startTopLeftForRotated.x + w / 2,
            y: startTopLeftForRotated.y + h / 2
          }, startTopLeftForRotated, this.angle)

          const currentTopLeft = calcRotatedPoint(startTopLeftForRotated, currentCenter, -this.angle)
          data = {
            ...currentTopLeft,
            width: w,
            height: h
          }
          break
        }

        case POSITION.rightCenter:
        case POSITION.topCenter:
        case POSITION.rightTop: {
          const startLeftBottomForRoated = calcRotatedPoint({ x: startX, y: startY + startH }, startCenter, this.angle)

          const currentCenter = calcRotatedPoint({
            x: startLeftBottomForRoated.x + w / 2,
            y: startLeftBottomForRoated.y - h / 2
          }, startLeftBottomForRoated, this.angle)

          const currentLeftBottom = calcRotatedPoint(startLeftBottomForRoated, currentCenter, -this.angle)

          currentLeftBottom.y -= h
          data = {
            ...currentLeftBottom,
            width: w,
            height: h
          }
          break
        }

        case POSITION.leftCenter:
        case POSITION.bottomCenter:
        case POSITION.leftBottom: {
          const startRightTopForRotate = calcRotatedPoint({
            x: startX + startW,
            y: startY
          }, startCenter, this.angle)

          const currentCenter = calcRotatedPoint({
            x: startRightTopForRotate.x - w / 2,
            y: startRightTopForRotate.y + h / 2
          }, startRightTopForRotate, this.angle)

          const currentRigthTop = calcRotatedPoint(startRightTopForRotate, currentCenter, -this.angle)

          currentRigthTop.x -= w
          data = {
            ...currentRigthTop,
            width: w,
            height: h
          }

          break
        }
      }
    }
    return data
  }

  getWidthAndHeightInBoundar(result, handlePoint, sPoint){
    const {
      maxHeight = Infinity,
      maxWidth = Infinity,
      minWidth = 20,
      minHeight = 20,
    } = this.option;
    const {x, y, width, height} = result
    // 限制的宽高，非等比例缩放
    let currentHeight = maxHeight < height ? maxHeight : minHeight > height ? minHeight : height;
    let currentWidth = maxWidth < width ? maxWidth : minWidth > width ? minWidth : width;

    const newCenter = {
      x: x + width / 2,
      y: y + height / 2,
    };
    // 拉伸中心点
    const yAxis = [POSITION.topCenter, POSITION.bottomCenter];
    const xAxis = [POSITION.leftCenter, POSITION.rightCenter];
    if (isCenterPoint(this.position) && !pointInRect(newCenter, handlePoint, sPoint)) {
      if (yAxis.includes(this.position)) {
        currentHeight = minHeight;
      }
      if (xAxis.includes(this.position)) {
        currentWidth = minWidth;
      }
    }
    // 等比例缩放
    if (
      !isCenterPoint(this.position) &&
      this.option.isLockProportions &&
      (minHeight > height || minWidth > width)
    ) {
      const rateW = minWidth / this.data.width;
      const rateH = minHeight / this.data.height;
      const maxRate = Math.max(rateH, rateW);
      if (maxRate === rateW) {
        currentWidth = minWidth;
        currentHeight = this.data.height * maxRate;
      } else {
        currentHeight = minHeight;
        currentWidth = this.data.width * maxRate;
      }
    }
    return {
      currentWidth,
      currentHeight,
    };
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