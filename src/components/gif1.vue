
<template>
  <div>
    <div
      ref="container"
      style="
        width: 800px;
        height: 500px;
        background: orange;
        position: relative;
      "
    >
      <div
        style="
          width: 324px;
          height: 324px;
          position: absolute;
          top: 0;
          left: 100px;
        "
      >
        <img ref="img1" src="../assets/nice.gif" alt="" />
      </div>

      <div
        style="
          width: 257px;
          height: 257px;
          position: absolute;
          top: 0;
          left: 430px;
        "
      >
        <img ref="img2" src="../assets/hot.gif" alt="" />
      </div>
    </div>

    <button @click="handleMove('rub1', 'index1')">move_img1</button>
    <button @click="handleMove('rub2', 'index2')">move_img2</button>
    <button @click="toGif">toGif</button>
  </div>
</template>

<script>
import SuperGif from 'libgif';
import domToImage from 'dom-to-image';
import GIF from 'gif.js'
  export default {
    name:'Gif1',

    data(){
      return{
        rub1:null,
        rub2:null,
        index1:0,
        index2:0,
        gif:null
      }
    },

    mounted(){
       this.init()
       this.initGif()
    },

    methods:{
       init(){
         this.gif = new GIF({
        width: 800,
        debug: true,
        height: 500,
        workers: 1,
        quality: 5,
        workerScript: '/gif.worker.js',
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
      
      initImg3(){
        const img3 = this.$refs.img3
        const rub = SuperGif({gif:img3})
        rub.load(()=>{
          const frames = rub.get_frames()
          const sum = frames.reduce((pre,current)=>pre + current.delay,0)
          console.log(sum)
        })
      },

       initGif(){
          const img1 = this.$refs.img1
          const img2 = this.$refs.img2
          
         this.rub1 = SuperGif({gif:img1})
          this.rub1.load(()=>{
            this.rub1.pause()
            this.rub1.move_to(this.index1)
          })

          this.rub2 = SuperGif({gif:img2})
          this.rub2.load(()=>{
            this.rub2.pause()
            this.rub2.move_to(this.index2)
          })
       },


       handleMove(rub,index){
         const length = this[rub].get_length()
         this[index] = this[index] === length ? 0 : this[index] + 1  
         this[rub].move_to(this[index])
         
       },

     async toGif(){

        

        const container = this.$refs.container
        const svg = await domToImage.toSvg(container)

        const img = new Image()
        img.src = svg

        // this.toFramesList()

      // document.body.appendChild(img)
       const framesList =  this.toFramesList()

       for(let i = 0 ; i < framesList.length ; i++) {
         const container = this.$refs.container
         const svg =await domToImage.toSvg(container)
         this.rub1.move_to(framesList[i].gif1Index)
         this.rub2.move_to(framesList[i].gif2Index)


         
          const imgDom = await this.svgToImage(svg)
          // console.log(imgDom)
          this.gif.addFrame(imgDom,{delay:framesList[i].delay * 10})
         
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


       toFramesList (){
         const frames1 = this.rub1.get_frames()
         const frames2 = this.rub2.get_frames()

         const sum1 = frames1.reduce((pre,current)=> pre + current.delay,0)
         const sum2 = frames2.reduce((pre,current)=> pre + current.delay,0)

         const average = (sum1 + sum2) / 2
         const diff = Math.abs(sum1 - average)

        const fn = (max,min) => {
          for(let i = 0 ; i < diff; i++ ){

           const maxIndex =  this.generateRandomIndex(max.length)
           const minIndex =  this.generateRandomIndex(min.length)
           
           max[maxIndex].delay -= 1
           min[minIndex].delay += 1

          }
        }

        if(sum1 > sum2) {
          fn(frames1,frames2)
        }else {
          fn(frames2,frames1)
        } 


        // const a = frames1.reduce((pre,current)=> pre + current.delay,0)
        // const b = frames2.reduce((pre,current)=> pre + current.delay,0)

        // console.log(frames1,frames2,'haha')

        return this.toGifFrames(frames1,frames2,average)
        
        
         
       },


      toGifFrames(frames1,frames2,average){
        const data1 = JSON.parse(JSON.stringify(frames1))
        const data2 = JSON.parse(JSON.stringify(frames2))
        const frames = []
        let gif1Index = 0
        let gif2Index = 0
        for(let i = 0 ; i < average; i++ ){
          const obj = {}
          obj.gif1Index = gif1Index
          obj.gif2Index = gif2Index

          data1[gif1Index].delay -= 1
          data2[gif2Index].delay -= 1

          if(data1[gif1Index].delay === 0) gif1Index += 1
          if(data2[gif2Index].delay === 0) gif2Index += 1

          frames.push(obj)
          
        }

        // console.log(frames)

        const hash = {}
        const result = []
        for(let i = 0 ; i < frames.length;i++){
          const key = `${frames[i].gif1Index}${frames[i].gif2Index}`
          if(!Reflect.has(hash,key)){
            hash[key] = i
            result.push(frames[i])
            frames[i].delay = 1
          }else {
            const index = result.findIndex((item)=> `${item.gif1Index}${item.gif2Index}` === key)
            result[index].delay += 1
          }
        }

        console.log('arr',result)

        return result
        
      },


      generateRandomIndex(lenght){
        const randomNum = Math.random()
        return Math.floor(randomNum * lenght )
      }

    }
  }
</script>

<style lang="scss" scoped>
</style>