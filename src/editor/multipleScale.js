import { deepCopy } from './helper'
import {ScaleHandler } from './drag'

export default class MultipleScale {

  constructor(rectData, type, selectedList,rotate) { 
    this.startRectData = { ...rectData }
    this.type = type
    this.selectedList = deepCopy(selectedList)
    this.scaleHandler = new ScaleHandler(rotate, type, this.startRectData, {
        minWidth: 100,
        minHeight: 100,
        isLockProportions: true,
      });
  }

  handlerScale(mousePosition) { 
    const newRectData = this.scaleHandler.handlerScale(mousePosition)
    const rateW = newRectData.width / this.startRectData.width 
    const rateH =newRectData.height / this.startRectData.height 
    const  result = []
    this.selectedList.forEach((item) => {
      const { x: startX, y: startY, mask: startMask, width:startW,height:startH,id} = item
      
      const xMaskStratInCanvas = startX + startMask.x
      const yMaskStratInCanvas = startY + startMask.y
      // 计算元素在多选框的开始距离
      const xMaskStartInRect = xMaskStratInCanvas - this.startRectData.x 
      const yMaskStartInRect = yMaskStratInCanvas - this.startRectData.y
     
     
      // 原图 信息
      const width = startW * rateW;
      const height = startH * rateH;
      const x = this.startRectData.x  + startX - (startX - xMaskStartInRect * rateW)
      const y = this.startRectData.y + startY - (startY - yMaskStartInRect * rateH)

       // 计算mask 信息，坐标是以画布为基础
       const maskW =  startMask.width * rateW
       const maskH = startMask.height * rateH

      // console.log(`%c${x},%c${y},%c${xMaskInCanvas},%c${yMaskInCanvas}`,'color:red','color:green','color:orange','color:blue')

      result.push({
        id,
        width,
        height,
        x,
        y,
        mask: {
          width:maskW,
          height:maskH,
          x:startMask.x,
          y:startMask.y
        }
      })
    });

    return result
  }
 }