<template>
  <div class="box">
    <img class="gif1" src="../assets/hot.gif" alt="" />
    <img class="gif2" src="../assets/nice.gif" alt="" />
    <button @click="toGif">toGif</button>
  </div>
</template>

<script>
import SuperGif from 'libgif';
import GIF from  'gif.js';
  export default {
    name:'Gifs',

    data(){
      return{
        gif:null,
      }
    },


    async mounted(){
      // this.toGif()
      // this.initGif()
    
    },

   
    
    methods:{

      initGif(){
         this.gif = new GIF({
        width: 1904,
        debug: true,
        height: 330,
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

     async toGif (){
       this.box = document.querySelector('.box').getBoundingClientRect()   
       const canvas = document.createElement('canvas')
       const ctx = canvas.getContext('2d')

       const cloneNode = document.querySelector('.box').cloneNode(true)

       const gif1 = cloneNode.querySelector('.gif1')  
       const gif2 = cloneNode.querySelector('.gif2')  

       const gifList = [gif1,gif2] 

       const durationList = []
       const framesList = [] 
       for(let i = 0; i < gifList.length ; i++){
          const rub = new SuperGif({gif:gifList[i]})
          const frames = await this.getFrames(rub)
          framesList.push(frames)
          const duration = frames.reduce((pre,current)=> pre + current.delay ,0)
          durationList.push(duration)
       }


        const num = this.getMaxCommonNum(durationList[0],durationList[1])
        let yueshu = durationList[0] * durationList[1] / num

        console.log(num,yueshu,durationList)

        const data = []
        let gif1Index = 0
        let gif2Index = 0

        let [gif1List,gif2List] = framesList

      

        let currentDelay1 = gif1List[0].delay,currentDelay2 = gif2List[0].delay

        while(yueshu > 0){
          const obj = {}

          //  obj.gif1Data = gif1List[gif1Index].data 
          //  obj.gif2Data = gif2List[gif2Index].data 

           obj.gif1Data = gif1Index + 1 
           obj.gif2Data = gif2Index + 1
           obj.delay = Math.min(gif1List[gif1Index].delay,gif2List[gif2Index].delay)




            if( gif1List[gif1Index].delay === gif2List[gif2Index].delay) {

              //  console.log(gif2List[gif2Index].delay,gif1List[gif1Index].delay)

               gif2Index = gif2Index === gif2List.length - 1 ? 0 : gif2Index + 1

               gif1Index = gif1Index === gif1List.length - 1 ? 0 : gif1Index + 1


               if(gif1Index === 0) {
                 gif1List[gif1List.length - 1].delay = currentDelay1
                          
               }else {
                 gif1List[gif1Index - 1 ].delay = currentDelay1
               }

               if(gif2Index === 0){
                  gif2List[gif2List.length - 1].delay = currentDelay2
                 
               }else {
                  gif2List[gif2Index - 1 ].delay = currentDelay2
               }



                currentDelay1 = gif1List[gif1Index].delay  

                currentDelay2 = gif2List[gif2Index].delay


            } else if(obj.delay === gif1List[gif1Index].delay ){

              

              gif2List[gif2Index].delay -= gif1List[gif1Index].delay


               gif1Index = gif1Index === gif1List.length - 1 ? 0 : gif1Index + 1

               if(gif1Index === 0) {
                 gif1List[gif1List.length - 1].delay = currentDelay1
                          
               }else {
                 gif1List[gif1Index - 1 ].delay = currentDelay1
               }

               currentDelay1 = gif1List[gif1Index].delay 
              
            }else {
              

              gif1List[gif1Index].delay -= gif2List[gif2Index].delay 

              gif2Index = gif2Index === gif2List.length - 1 ? 0 : gif2Index + 1

              if(gif2Index === 0){
                  gif2List[gif2List.length - 1].delay = currentDelay2
                 
               } else {
                  gif2List[gif2Index - 1 ].delay = currentDelay2
               }

               currentDelay2 = gif2List[gif2Index].delay

            }

            
      
            yueshu -= obj.delay

            if(obj.delay >1 ){
              data.push(obj)
            }

           

        }
          const sum = data.reduce((pre,curent)=> pre + curent.delay,0)
          console.log('sum',sum)
         console.log(data,'data')




        const contentHtml = document.querySelector('.box').cloneNode(true)
        const git111 = contentHtml.querySelector('.gif1')
        const git222 = contentHtml.querySelector('.gif2')
        
        console.log('contentHtml',contentHtml)
        for(let i = 0; i < data.length;i++) {
          canvas.width = 257
          canvas.height = 257
          ctx.clearRect(0,0,this.box.width,this.box.height)
          ctx.save()
          ctx.putImageData(data[i].gif1Data,0,0)
          ctx.restore()
          const url1 = canvas.toDataURL('image/jpeg')


          canvas.width = 324
          canvas.height = 324
          
          ctx.clearRect(0,0,this.box.width,this.box.height)
          ctx.save()
          ctx.putImageData(data[i].gif2Data,0,0)
          ctx.restore()
          const url2 = canvas.toDataURL('image/jpeg')

          git111.src = url1
          git222.src = url2

          document.body.appendChild(git111)


          const xmls = new XMLSerializer();
          
          const html = xmls.serializeToString(cloneNode)

           const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${this.box.width}' height='${this.box.height}'><style></style><foreignObject x='0' y='0' width='${this.box.width}' height='${this.box.height}'>${html}</foreignObject></svg>`;

          const dataURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svg,
      )}`;

        const imgDom = await this.svgToImage(dataURI)
        
        await this.gif.addFrame(imgDom,{delay:data[i].delay * 10})

        }



      this.gif.render();

        // const newData = data.filter(({delay})=> delay > 1)
        
       
        
        

        // for(let i = 0;i< gifList.length;i++ ){
        //   const rub = new SuperGif({gif:gifList[i]})
        //   const frames = await this.getFrames(rub)
        //   for(let j = 0; j < frames.length; j++) {
        //     ctx.clearRect(0,0,this.box.width,this.box.height)
        //     ctx.save()
        //     ctx.putImageData(frames[j].data,0,0)
        //     ctx.restore()
        //     const url = canvas.toDataURL('image/jpeg')
        //     const img = new Image()
        //     img.src = url
        //     document.body.appendChild(img)

        //     const svg = this.generateSvg(gifList[i].className,base64)
        //     const image = await this.svgToImage(svg)
        //     this.gif.addFrame(image,{})
        //     this.gif.addFrame(canvas,{copy:true,daley:frames[i].daley * 10})
        //   }
        // }


        
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


      getFrames(rub){
        return new Promise((resolve)=>{
          rub.load(()=>{
            console.log(rub.get_frames())
            resolve(rub.get_frames())
          })
        })
      },

      

      generateSvg(className,base64){
       
        const contentHtml = document.querySelector('.box').cloneNode(true)  
        const img = contentHtml.querySelector(`.${className}`)
        img.src = base64
        const xmls = new XMLSerializer();
        const html = xmls.serializeToString(contentHtml)

        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${this.box.width}' height='${this.box.height}'><style></style><foreignObject x='0' y='0' width='${this.box.width}' height='${this.box.height}'>${html}</foreignObject></svg>`;
        const dataURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svg,
      )}`;

      console.log('dataURI',dataURI)

      return dataURI


      },


      getMaxCommonNum (num1 , num2){
        if(num1 % num2 === 0) return num2
        else return this.getMaxCommonNum(num2,num1 % num2)
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
    }
  }
</script>
