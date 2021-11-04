<template>
  <div>
    <input type="file" accept=".psd" @change="handleInputChange" />
    <el-button id="btn" @click="handleClick">按钮</el-button>
  </div>
</template>

<script>
// import PSD from 'psd'
  export default {
    name:'ParsePsd',

    data(){
      return {
        value:"",
        work:""
      }
    },

    mounted(){
      this.work = new Worker('/work.js')
      this.work.onmessage  = function (e) {
        console.log('hhah',e)
      }
      // this.work.postMessage(1000)
    },

    methods:{
      handleInputChange(e){
         let file = Array.prototype.slice.call(e.target.files);
         new Promise((resolve,reject)=>{
           const fileReader = new FileReader()
           const btn = document.getElementById('btn')
           console.log(btn)
           fileReader.onload =  (e) => {
                const { result } = e.target;
                this.work.postMessage({result,btn})
                resolve()
           }
           fileReader.readAsArrayBuffer(file[0]);
           fileReader.onerrer = reject
         })



      },

      

     async handleClick(e){
        console.log('点击',e)

      const res = await fetch('https://test-media-hw.oss-cn-shanghai.aliyuncs.com/kunrukh4fqay3jj.json')
      const blob = await res.blob();
      const data =await blob.text()

      console.log(res,JSON.parse(data))
      
      }
    },
  }
</script>

<style lang="scss" scoped>
</style>