<template>
  <div>
    <img class="gif" src="../assets/hot.gif" alt="" />

    <button @click="handleClick">按钮</button>
  </div>
</template>

<script>
  import SuperGif from 'libgif';
  import GIF from  'gif.js';

  export default {
    name:'NewGif',

    data(){
      return {
        gif:null
      }
    },
    created(){
      this.initGif()
    },

    mounted(){
      this.init()
    },

    methods: {
      initGif(){
         this.gif = new GIF({
        width: 257,
        debug: true,
        height: 257,
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

      init(){
        

        const img = document.querySelector('.gif')

        const rub = new SuperGif({gif:img})
      
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 257
        canvas.height = 257
        
        rub.load(async()=>{
          const frames = rub.get_frames()
          console.log(frames)
           for(let i =0; i < frames.length;i++){
            console.log(frames[i])
            ctx.clearRect(0,0,canvas.width,canvas.height)
            ctx.save();
            ctx.putImageData(frames[i].data,0,0);
            ctx.restore();

            this.gif.addFrame(canvas,{copy:true,delay:frames[i].delay * 10})
          }

          this.gif.render();
        })
      },

       exportBlob(canvas){
        return new Promise((resolve)=>{
          canvas.toBlob ((blob)=>{
            resolve(blob)
          })
        })
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

     handleClick(){
       const newGif = document.querySelector('.newGif')
      //  console.log(newGif)
       const rub  = new SuperGif({gif:newGif})
       rub.load(()=>{
         console.log(rub.get_frames())
       })
     },
    }
  }
</script>

<style lang="scss" scoped>
</style>