<template>
  <div class="gif2-container">
    <div class="img-container">
      <div
        v-for="item in strawList"
        :key="item.id"
        :id="item.id"
        :class="item.id"
        :style="{
          position: 'absolute',
          width: item.width + 'px',
          height: item.height + 'px',
          top: item.top + 'px',
          left: item.left + 'px',
        }"
      >
        <img
          :style="{
            width: item.width + 'px',
            height: item.height + 'px',
          }"
          :src="item.url"
          alt=""
        />
      </div>
    </div>

    <div id="father">
      <div id="1003"></div>
    </div>
  </div>
</template>

<script>
import GIF from 'gif.js'
import SuperGif from 'libgif';
import domToImage from 'dom-to-image';

import { strawList }  from './strawList'

  export default {
    name:'Gif2',
    data(){
      return {
        strawList,
        gif: null
      }
    },

    mounted(){
      this.init()
      this.parseGif()
    },

    methods:{
      init(){
         this.gif = new GIF({
        width: 800,
        debug: true,
        height: 500,
        workers: 10,
        quality: 5,
        workerScript: '/gif.worker.js',
        dither:true
        })


        this.gif.on('finished',function(blob){
          var file = new FileReader();
          file.readAsDataURL(blob);

        file.onload = function(){
            const img = new Image()
            img.className = 'newGif'
            img.src = file.result
            document.body.appendChild(img)
        }
      }) 

      },

     async parseGif(){
        const cloneNode = document.querySelector('.img-container').cloneNode(true)
        document.body.appendChild(cloneNode)
        const frameList = []
        for(let i = 0 ; i < this.strawList.length;i++){
          const { id } = this.strawList[i]
          const img = cloneNode.querySelector(`#${id}`).querySelector('img')
          const rub = SuperGif({gif:img,max_width:this.strawList[i].width})
          const frames = await this.getFrames(rub) 
          frameList.push({frames,rub})
        } 


         
        
        const data = this.toFrameData(frameList)

        for(let i = 0; i < data.length;i++) {
          for(let j = 0; j < data[i].frames.length; j++) {
            data[i].frames[j].rub.move_to(data[i].frames[j].index)
          }
          const svg = await domToImage.toSvg(cloneNode)
          const imgDom = await this.svgToImage(svg)

          this.gif.addFrame(imgDom,{delay:data[i].delay * 10})
               
        }     
         this.gif.render();
      },

      svgToImage(svg){
        return new Promise((resolve)=>{
          const img = new Image()
          img.src = svg
          img.onload = ()=>{
            resolve(img)
          }
        })
      },

      toFrameData(frameList){
       const result = []
       const indexList = []

       const {list,averageTime} = this.toGifDuration(frameList)

       for(let i = 0 ; i < list.length; i++) {
         indexList.push({index:0,delay:list[i].frames[0].delay})
       }
       
       

       for(let i = 0; i < averageTime;i++) {
         const obj = {}
         obj.frames = []
         let key = ''
         for(let j = 0; j < list.length;j++){
           obj.frames.push( {
             index:indexList[j].index,
             rub:list[j].rub
           })

           key += indexList[j].index
           indexList[j].delay -= 1
          
           if(indexList[j].delay === 0){
             indexList[j].delay = list[j].frames[indexList[j].index + 1]?.delay ?? list[j].frames[indexList[j].index]?.delay
             indexList[j].index += 1
           }
         }

        obj.key = key

        result.push(obj)
       }

        const hash = {}
        const data = []
        for(let i = 0 ; i < result.length;i++){
          if(!Reflect.has(hash,result[i].key)){
            hash[result[i].key] = i
            result[i].delay = 1
            data.push(result[i])
          }else {
            const index = data.findIndex(({key})=> key === result[i].key)
            data[index].delay += 1
          }
        }

        return data
       
      },

      toGifDuration(frameList){
        // 现在这里是取平均值
        const obj = {}
        

        let allTime = 0
        for(let i =0; i < frameList.length;i++) {
          const timer = frameList[i].frames.reduce((pre,current)=> pre + current.delay,0)
          obj[timer] = frameList[i]
          allTime += timer
        }

        // 这里做判断是否使用最大的时长的gif
        const keys = Object.keys(obj)
        const maxKey = Math.max(...keys)
        const minKey = Math.min(...keys)

        console.log('maxKey',maxKey,minKey)

        const averageTime = allTime / frameList.length

        const changeTime = (frame,diffTime, isAdd) => {
          let index = 0
          for(let i = 0 ; i < diffTime; i++ ){

            // TODO: 处理边界值，delay小于0 的情况
            
            if(isAdd) {
              frame[index].delay += 1
            }else {
              frame[index].delay -=1
            }
            index =  index === frame.length - 1 ? 0 : index + 1 
          }
        }

        for (let k in obj) {
          const diffTime = Math.abs(Number(k) - averageTime)
          if(Number(k) > averageTime) {
            changeTime(obj[k].frames,diffTime,false)
          }else if(Number(k) < averageTime){
            changeTime(obj[k].frames,diffTime,true)
          }
          
        } 
   
        return {
         list: Object.values(obj),
         averageTime
        }
      },

      getFrames(rub){
        return new Promise((resolve)=>{
           rub.load(()=>{
            const frames = rub.get_frames()
            rub.pause()
            resolve(frames)
          })
        })
      }
    },
  }
</script>

<style  scoped>
.img-container {
  margin: 0 auto;
  width: 800px;
  height: 500px;
  background: black;
  position: relative;
}
</style>