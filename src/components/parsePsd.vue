<template>
  <div>
    <input type="file" accept=".psd" @change="handleInputChange" />
    <el-button id="btn" @click="handleClick">按钮</el-button>

    <div class="box" v-if="data">
      <svg
        class="svg"
        width="480"
        height="307"
        viewBox="0 0 480 307"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- <defs> -->
        <linearGradient
          id="linear"
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
        >
          <stop offset="0%" stop-color="red" />
          <stop offset="50%" stop-color="blue" />
          <stop offset="100%" stop-color="pink" />
        </linearGradient>
        <!-- </defs> -->
        <rect
          x="4"
          y="4"
          ry="150"
          rx="150"
          :style="svgStyle"
          width="471"
          height="300"
        ></rect>
        <!-- <ellipse cx="240" cy="200" rx="200" ry="100"  :style="svgStyle"/> -->
      </svg>
    </div>

    <!-- <img
      src="https://test-media-hw.oss-cn-shanghai.aliyuncs.com/kvq9dgu03l1lhuq.kvq9dgg3rli1k6t"
    /> -->
  </div>
</template>

<script>
  export default {
    name:'ParsePsd',

    data(){
      return {
        value:"",
        work:"",
        data:null
      }
    },

    mounted(){
      this.work = new Worker('/work.js')
      this.work.onmessage  =  (e) => {
        this.data = e.data
        this.$nextTick(()=>{
          this.drawCanvas()
        })
        
      }

     
    },

    computed:{
     svgStyle (){
       const {storkeWidth,storkeDashSet} = this.data
      
       const stlye = {
          // fill:'transparent',
          fill:'url(#linear)',
          strokeWidth: storkeWidth,
          // stroke: storkeColor,
          // stroke:'url(#linear)'
          
       }
       if(storkeDashSet.length){
        const A = storkeDashSet[0] * storkeWidth
        const B = storkeDashSet[1] * storkeWidth
        console.log(A,B)
        stlye.strokeDasharray=`${A},${B}`


        if(!A) stlye.strokeLinecap = 'round'

       }
      return stlye
      }
    },

    

    methods:{
    async drawCanvas(){
      
        // const { maskBackground } = this.data
        const canvas = document.createElement('canvas')
        canvas.height = 303
        canvas.width = 478

        const ctx = canvas.getContext('2d')
        document.body.appendChild(canvas)


        const mask = "https://luban-material.oss-cn-shanghai.aliyuncs.com/kvubbrpcg0md5ow.kvubbrmib9gakza"

       
        const maskImage = await this.maskImage(mask)   
       
        const image = await this.compositePicture()


        ctx.fillStyle = "rgb(212.98443853855133,222.8715991973877,255)"
        ctx.fillRect(0,0,478,303)

        ctx.save();
        ctx.drawImage(maskImage,0,0, 478,303)
        ctx.globalCompositeOperation = 'source-in';

        ctx.drawImage(image,0,-334,478,971)

        ctx.restore();
        
      },

    async compositePicture(){
        const pic = "https://luban-material.oss-cn-shanghai.aliyuncs.com/kvubbro7q2q5msa.kvubbrmgs8o5o62"
        const image = await this.maskImage(pic) 
        const canvas = document.createElement('canvas')
        canvas.width = 478
        canvas.height = 971
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = "rgb(212.98443853855133,222.8715991973877,255)"
        ctx.fillRect(0,0,478,971)
        ctx.drawImage(image,0,0,478,971)

        const base64 = canvas.toDataURL()
        return await this.maskImage(base64)
        
      },

      maskImage(src){
       return new Promise((resolve)=>{
         const image = new Image()
         image.crossOrigin = 'anonymous'
         image.src = src
         image.onload = ()=>{
           resolve(image)
         } 
       })
      },

      handleInputChange(e){
         let file = Array.prototype.slice.call(e.target.files);
         new Promise((resolve,reject)=>{
           const fileReader = new FileReader()
           fileReader.onload =  (e) => {
                const { result } = e.target;
                this.work.postMessage({result})
                resolve()
           }
           fileReader.readAsArrayBuffer(file[0]);
           fileReader.onerrer = reject
         })

      },

     async handleClick(){
      // const res = await fetch('https://test-media-hw.oss-cn-shanghai.aliyuncs.com/kunrukh4fqay3jj.json')
      // const blob = await res.blob();
      // const data =await blob.text()
      // console.log(res,JSON.parse(data))
      console.log('navigator',navigator.serviceWorker)
      navigator.serviceWorker.register('./service-worker.js')
      
      }
    },

  }
</script>

<style  scoped>
.box {
  position: relative;
}
.svg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>