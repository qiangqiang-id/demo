import { POSITION } from './constants'

// 绕原点逆时针旋转后的点坐标
// 默认绕原点旋转
const rotate = ({ x, y }, deg, origin = { x: 0, y: 0 }) => ({
  x: (x - origin.x) * Math.cos(deg) + (y - origin.y) * Math.sin(deg) + origin.x,
  y: (origin.x - x) * Math.sin(deg) + (y - origin.y) * Math.cos(deg) + origin.y
})
const toDeg = (angle) => angle / 180 * Math.PI
const getCenterPoint = (box) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2
})


/**
 * 转化为顶点坐标数组
 * @param {Object} box 
 */
function toRect (box) {
  let deg = toDeg(box.angle)
  let cp = getCenterPoint(box)
  return [rotate({
    x: box.x,
    y: box.y
  }, deg, cp), rotate({
    x: box.x + box.width,
    y: box.y,
  }, deg, cp), rotate({
    x: box.x + box.width,
    y: box.y + box.height,
  }, deg, cp), rotate({
    x: box.x,
    y: box.y + box.height
  }, deg, cp)]
}

/**
 * 计算投影半径
 * @param {Array(Number)} checkAxis 检测轴 [cosθ,sinθ]
 * @param {Array} axis 目标轴 [x,y]
 */
function getProjectionRadius (checkAxis, axis) {
  return Math.abs(axis[0] * checkAxis[0] + axis[1] * checkAxis[1])
}

/**
 * 判断是否碰撞
 * @param {Array} rect1 矩形顶点坐标数组 [Pa,Pb,Pc,Pd]
 * @param {*} rect2 
 */
export function isCollision (box1, box2) {
  box1.angle = 360 - box1.angle
  box2.angle = 360 - box2.angle

  let rect1 = toRect(box1)
  let rect2 = toRect(box2)
  const vector = (start, end) => {
    return [end.x - start.x, end.y - start.y]
  }
  // 两个矩形的中心点
  const p1 = getCenterPoint(box1)
  const p2 = getCenterPoint(box2)
  //向量 p1p2
  const vp1p2 = vector(p1, p2)
  //矩形1的两边向量
  let AB = vector(rect1[0], rect1[1])
  let BC = vector(rect1[1], rect1[2])
  //矩形2的两边向量
  let A1B1 = vector(rect2[0], rect2[1])
  let B1C1 = vector(rect2[1], rect2[2])
  // 矩形1 的两个弧度
  let deg11 = toDeg(box1.angle)
  let deg12 = toDeg(90 - box1.angle)
  // 矩形2 的两个弧度
  let deg21 = toDeg(box2.angle)
  let deg22 = toDeg(90 - box2.angle)
  console.log(deg21,deg22)
  // 投影重叠
  const isCover = (checkAxisRadius, deg, targetAxis1, targetAxis2) => {
    let checkAxis = [Math.cos(deg), Math.sin(deg)]
    let targetAxisRadius = (getProjectionRadius(checkAxis, targetAxis1) + getProjectionRadius(checkAxis, targetAxis2)) / 2
    let centerPointRadius = getProjectionRadius(checkAxis, vp1p2)
    console.log(`checkAxis:${checkAxis},三个投影:${checkAxisRadius}, ${targetAxisRadius}, ${centerPointRadius}`)
    return checkAxisRadius + targetAxisRadius > centerPointRadius
  }
  return isCover(box1.width / 2, deg11, A1B1, B1C1) &&
    isCover(box1.height / 2, deg12, A1B1, B1C1) &&
    isCover(box2.width / 2, deg21, AB, BC) &&
    isCover(box2.height / 2, deg22, AB, BC)
}


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

/**
 * 计算矩形的物理位置，针对翻转情况
 * @param {*} data
 * @returns 
 */
export function calcPhysicsPosition (data) {
  let { x, y, width, height, anchor, scale } = data

  const center = {
    x: x + width * anchor.x,
    y: y + height * anchor.y
  }

  if (scale.x < 0) {
    x = center.x - (x + width - center.x)
  }

  if (scale.y < 0) {
    y = center.y - (y + height - center.y)
  }
  return {
    x, y
  }

}

/**  深拷贝对象 */
export function deepCopy(target) {
  if (typeof target === 'object') {
    const result = Array.isArray(target) ? [] : {};
    for (const key in target) {
      if (typeof target[key] === 'object') {
        result[key] = deepCopy(target[key]);
      } else {
        result[key] = target[key];
      }
    }
    return result;
  }
  return target;
}


/**
 * 检测 p0 是否在 p1 与 p2 建立的矩形内
 * @param  {Object}  p0 被检测的坐标
 * @param  {Object}  p1 点1坐标
 * @param  {Object}  p2 点2坐标
 * @return {Boolean}    检测结果
 */
export const pointInRect = (p0, p1, p2) => {
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
 * 判断当前的拉动点是否是中心点
 * @param position
 * @return   boolean
 */
 export const isCenterPoint = (position) => {
  const centerPonitList = [
    POSITION.topCenter,
    POSITION.leftCenter,
    POSITION.rightCenter,
    POSITION.bottomCenter,
  ];
  return centerPonitList.includes(position);
};


