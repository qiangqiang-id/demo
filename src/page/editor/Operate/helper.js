import { POSITION } from '../constants'


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

/**
 *  获取中心点
 * @param {左上角坐标} prev 
 * @param {右下角坐标} now 
 * @returns 
 */
export const getMiddlePoint = (prev, now) => {
  return {
    x: prev.x + ((now.x - prev.x) / 2),
    y: prev.y + ((now.y - prev.y) / 2)
  }
}