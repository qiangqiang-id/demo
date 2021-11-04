<template>
  <div class="box">
    <div class="gif">
      <div
        id="container"
        style="width: 550px; height: 550px; background: orange"
      >
        <img id="hot" />
        <!-- <img
          crossorigin="anonymous"
          ref="imgRef"
          src="https://gd-filems.dancf.com/mcm79j/mcm79j/92705/1e3eafc2-5a81-461f-9a4a-3aec9ccfcbd84456342.gif"
        /> -->

        <!-- <img
          style="width: 100%"
          src="https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210201-184425-35eb.png"
        /> -->

        <p>gif 截图方案</p>
      </div>

      <div>
        <img id="result" />
      </div>
    </div>

    <img
      ref="imgRef"
      class="imgRef"
      src="https://gd-filems.dancf.com/mcm79j/mcm79j/92705/1e3eafc2-5a81-461f-9a4a-3aec9ccfcbd84456342.gif"
    />

    <div>
      <button @click="handleClick">gif</button>
      <button @click="handleRequset">请求</button>
      <button @click="handleGenerateImage">生成svg图方案</button>
      <button @click="generateBlob">转blob</button>
      <button @click="getFrames">获取图片列表</button>
    </div>

    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import SuperGif from  'libgif'
import GIF from 'gif.js'
import domToImage from 'dom-to-image'



import { strawList } from './strawList'
export default {
    name:'Gif',

    data(){
      return {
        gif:null,
        dom:null,
        moveable:null,
        strawList,
        list:[],
        frames:[]
      }
    },

    mounted(){

     this.gif = new GIF({
        width: 550 ,
        debug: true,
        height: 524,
        workers: 1,
        quality: 5,
        workerScript: '/gif.worker.js',
        })

       this.gif.on('finished',function(blob){
          var file = new FileReader();
          file.readAsDataURL(blob);

        file.onload = function(){
            const img = new Image()
            img.src = file.result
            document.body.appendChild(img)

        }
      }) 


      
      this.init()
      
    },

    methods: {


      init(){
        const img = new Image()
        img.src = 'https://gd-filems.dancf.com/mcm79j/mcm79j/92705/1e3eafc2-5a81-461f-9a4a-3aec9ccfcbd84456342.gif'
        img.onload = () =>{
          const rub = new SuperGif({gif:img})
          rub.load(()=>{
            console.log(rub.get_frames())
          })
        }
      },


     async handleClick(){
    
      const data =  await this.getImageList()
      
      setTimeout(()=>{
        this.generateGif(data)
       })       
    },

    getImageList(){
      const imgObjList = []
      const imgDom = this.$refs.imgRef
      const rub = new SuperGif({gif:imgDom,max_width:257})

      const that = this

      return new Promise(function(resolve){
        rub.load(function(){
          for(let i =1; i <= rub.get_length();i++){
            rub.move_to(i)
            const imageDom = new Image()
            imageDom.src = rub.get_canvas().toDataURL('image/jpeg',1)   
            imageDom.onload = function (){
              imgObjList.push(imageDom)
            }
          }

         that.list = imgObjList
         resolve(imgObjList)
         })  
      })
      
    },

    getFrames(){
      const imgDom = this.$refs.imgRef
      const rub = new SuperGif({gif:imgDom,max_width:257})
      return new Promise((resolve)=>{
         rub.load(async()=>{
       this.frames = rub.get_frames()
       const imgList = await this.doImg(imgDom)
       resolve(imgList)
      })
    }) 
   },

  async doImg (imgDom){
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = imgDom.width
      canvas.height = imgDom.height

      const result = []

      for(let i=0;i<this.frames.length;i++){
        ctx.clearRect(0,0,imgDom.width,imgDom.height)
        ctx.save();
        ctx.putImageData(this.frames[i].data,0,0);
        ctx.restore();
        const blob = await this.exportBlob(canvas)
        const base64 =await this.blobToBase64(blob)
        result.push(base64)
      }

    return result
   },

   exportBlob(canvas){
    return new Promise((resolve)=>{
       canvas.toBlob ((blob)=>{
         resolve(blob)
       })
     })
   },

   async generateGif(imgObjList){
    
      const container = await domToImage.toSvg(this.dom)
      const image = new Image()
      image.src = container

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const {height,width} = this.dom.getBoundingClientRect()

      canvas.width = width
      canvas.height = height

      image.onload = ()=>{
        for(let i = 0 ; i < imgObjList.length;i++){
         ctx.save();
         ctx.drawImage(image,0,0,width,height);
         ctx.drawImage(imgObjList[i],0,0,257,257);
         ctx.restore();
         this.gif.addFrame(canvas,{copy:true,delay:1})
         ctx.clearRect(0,0,width,height)
        }
      this.gif.render()
      }

    },


  async handleGenerateImage() {

      let contentHtml = document.querySelector('#container').cloneNode(true);

      const hotDom = contentHtml.querySelector('#hot')

      const frames =await this.getFrames()
      
      for(let i = 0 ;i < frames.length;i++){
      hotDom.src = frames[i]
      const xmls = new XMLSerializer();
      const html = xmls.serializeToString(contentHtml)

      // prettier-ignore
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${550}' height='${550}'><style></style><foreignObject x='0' y='0' width='${550}' height='${550}'>${html}</foreignObject></svg>`;

      const dataURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svg,
      )}`;


      // console.log(dataURI);
      // document.getElementById('result').src = dataURI

     

      // document.body.appendChild(img)
      



       
     await this.addFrame(dataURI)
    
      // const contentHtml = document.getElementById('container')
      
      }

       this.gif.render()
    },

    addFrame(dataURI){
      const img = new Image()
      img.src = dataURI
      // document.body.appendChild(img)
     return new Promise((resolve)=>{
         this.gif.addFrame(img,{copy:false,delay:1})
         resolve()
      })
    },

  async generateBlob(){
      // const canvas = document.createElement('canvas')
      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext('2d')
      const domImage = document.getElementById('hot')
      const width = 257
      const height = 257
      canvas.width = width
      canvas.height = height

    
     

      // const svg = await domToImage.toSvg(i)

      const img = new Image()
      img.crossOrigin = 'anonymous';

      img.src = 'https://gd-filems.dancf.com/mcm79j/mcm79j/92705/1e3eafc2-5a81-461f-9a4a-3aec9ccfcbd84456342.gif'

      img.onload =  ()=> {   
        ctx.drawImage(img,0,0,height,height)

         canvas.toBlob(async (blob)=>{
         const base64 =await this.blobToBase64(blob)
         console.log(domImage)
         domImage.src = base64
        
      })
      }
  

     
    },


  blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsDataURL(blob);
    fileReader.onerror = () => {
      reject(new Error('blobToBase64 error'));
    };
  });
},

    handleRequset(){
      fetch("http://localhost:8082",{
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body:JSON.stringify({
          // url:"https://meizi-test.shiguangkey.com/img-editor/?id=292089",
          url:"http://localhost:8081/#/helloWorld",
          cookies: {
            name: 'tz-admin-token-test',
            value: '0x77d89707bdb8e1e40314e19bb34cf4',
            domain: '.shiguangkey.com'
          },
          type:'screenshot',
        })
      })
    },

    
    }
  }
</script>

<style  scoped>
.gif {
  display: flex;
  justify-content: space-around;
}

/* #container {
  width: 550px;
  height: 550px;
  background: orange;
} */

/* .strawImage {
  width: 100%;
  height: 100%;
} */

button {
  margin-right: 10px;
  height: 30px;
}
</style>