import { deepCopy } from './helper'
import {ScaleHandler } from './drag'
import { POSITION } from './constants';

export default class MultipleScale {

  constructor(rectData, type, selectedList,rotate) { 
    this.startRectData = { ...rectData }
    this.type = type
    this.selectedList = deepCopy(selectedList)
    this.scaleHandler = new ScaleHandler(rotate, type, this.startRectData, {
        minWidth: 50,
        minHeight: 50,
        isLockProportions: true,
      });
  }

  handlerScale(mousePosition) { 
    const newRectData = this.scaleHandler.handlerScale(mousePosition)
    // 拉伸比例
    const rateW = newRectData.width / this.startRectData.width 
    const rateH = newRectData.height / this.startRectData.height 
    const  result = []
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
   
      let rectX = 0
      let rectY = 0

      switch (this.type) {
        case POSITION.rightBottom: {
          // 拉伸增长基数
          const xMaskStartInRect = xMaskStratInCanvas - this.startRectData.x
          const yMaskStartInRect = yMaskStratInCanvas - this.startRectData.y
          // mask 在画布中的位置
          rectX = this.startRectData.x + xMaskStartInRect * rateW
          rectY = this.startRectData.y + yMaskStartInRect * rateH
          break;
        }
          
        case POSITION.rightTop: { 
          // 拉伸增长基数
          const xMaskStartInRect = xMaskStratInCanvas - this.startRectData.x
          const yMaskStartInRect = yMaskStratInCanvas - (this.startRectData.y + this.startRectData.height) 
          rectX = this.startRectData.x + xMaskStartInRect * rateW
          rectY = this.startRectData.y + yMaskStartInRect * rateH + this.startRectData.height 
          break;
        }
          
        case POSITION.leftBottom: { 
          // 拉伸增长基数
          const xMaskStartInRect = xMaskStratInCanvas - (this.startRectData.x +  this.startRectData.width)
          const yMaskStartInRect = yMaskStratInCanvas - this.startRectData.y 
          rectX = this.startRectData.x + xMaskStartInRect * rateW + this.startRectData.width 
          rectY = this.startRectData.y + yMaskStartInRect * rateH
          break;
        }
          
        case POSITION.leftTop: { 
           // 拉伸增长基数
          const xMaskStartInRect = xMaskStratInCanvas - (this.startRectData.x +  this.startRectData.width)
          const yMaskStartInRect = yMaskStratInCanvas - (this.startRectData.y + this.startRectData.height)
          rectX = this.startRectData.x + xMaskStartInRect * rateW + this.startRectData.width 
          rectY = this.startRectData.y + yMaskStartInRect * rateH + this.startRectData.height 
          break;
        }
      }
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
    return {
      list: result,
      data:newRectData
    }
  }
 }