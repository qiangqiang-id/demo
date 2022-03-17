<template>
  <div class="container">
  <div class="name-box" v-for="(item,index) in nameList" :key="item" :style="{top:index * 40  + 'px' }" @mousedown="handleMousedown"> {{item}}</div>

  <div class="table">
    <div class="row row-th"> 
      <div class="row-item" v-for="item in headerList" :key="item">{{item}}</div>
    </div>

    <div class="row" v-for="(item,index) in tableData" :key="item.age">
      <div 
      :class="['row-item',key === 'name' ? `nameDom${index}` : '',
       key === 'name' && intersectionNameDomIndex === index ? 'active' : '']"
       v-for="(value,key) in item" :key="key">{{value}}</div>
    </div>

  </div>
</div>

</template>

<script>
export default {
  name:'demo',
  data(){
    return{
      nameList:['喜洋洋','懒洋洋','美羊羊','沸羊羊','暖洋洋'],
      targetDom:undefined,
      diffX:0,
      diffY:0,
      headerList:['年龄','名字','地址','爱好'],
      nameDomObj:{},
      intersectionNameDomIndex:undefined,
      tableData: [{
          age: 10,
          name: '',
          address: '长沙',
          like:'啊啊哈哈'
        }, {
          age: 11,
          name: '',
          address: '长沙',
          like:'啊啊哈哈'
        }, {
          age: 12,
          name: '',
          address: '长沙',
          like:'啊啊哈哈'
        }, {
          age: 13,
          name: '',
          address: '长沙',
          like:'啊啊哈哈'
        }]
    }
  },

  mounted(){
    for(let i =0;i < this.tableData.length; i++) {
      const nameDom = document.querySelector(`.nameDom${i}`)
      this.nameDomObj[i] = nameDom.getBoundingClientRect()
    }

  },

  methods:{
    handleMousedown(downEvent){
      this.targetDom = downEvent.target
      const {x,y} = this.targetDom.getBoundingClientRect()
      this.diffX = downEvent.clientX - x
      this.diffY = downEvent.clientY - y
      
      document.addEventListener('mousemove',this.handleMousemove)
      document.addEventListener('mouseup',this.handleMouseup)
    },

   handleMousemove(moveEvent) {
     Object.assign(this.targetDom.style,{
        top:moveEvent.clientY - this.diffY + 'px',
        left: moveEvent.clientX  -this.diffX  + 'px'
      })

    this.intersectionNameDomIndex =  this.getIntersectionNameDom(this.targetDom.getBoundingClientRect())
   },

   handleMouseup(){
     document.removeEventListener('mousemove',this.handleMousemove)
     document.removeEventListener('mouseup',this.handleMouseup)

     const text = this.targetDom.innerText
     if(this.intersectionNameDomIndex || this.intersectionNameDomIndex === 0 ) {
       this.tableData[this.intersectionNameDomIndex].name = text
       this.intersectionNameDomIndex = undefined
     }
     const index = this.nameList.indexOf(text)
     Object.assign(this.targetDom.style,{
       left:0,
       top:index * 40 + 'px'
       })
   },

   getIntersectionNameDom(target){
     let result 
     let heightDiff = 0
     const {top,left,right,bottom} = target
      Object.entries(this.nameDomObj).forEach(([key,value]) => {
        const {left:l,right:r,top:t,bottom:b} = value

        const outBoxWidth = Math.max(right,r) - Math.min(left,l)
        const outBoxHeight = Math.max(bottom,b) - Math.min(top,t)

        const innerBoxWidth = (right - left) + (r - l) 
        const innerBoxHeight = (bottom - top) + (b - t) 
        
        if(innerBoxWidth > outBoxWidth && innerBoxHeight > outBoxHeight ) {
          const diff =innerBoxHeight - outBoxHeight
          if(diff  > heightDiff){
            heightDiff = diff
            result = key 
          }
        }
      })
      return Number(result)
   },

  }
}

</script>


<style scoped>

.container{
  height: 100%;
  position: relative;
}
.name-box{
  position: absolute;
  left: 0;
  height: 30px;
  width: 60px;
  border:1px solid red;
  cursor: pointer;
  z-index: 10000;
  text-align: center;
  line-height: 30px;
  user-select: none;
}

.table {
  position: absolute;
  top: 200px;
  border-top: 1px solid #000;
  border-left: 1px solid #000;
}

.active-name{
  background-color: pink;
}

.row{
  height: 40px;
  width: 400px;
  display: flex;
  line-height: 40px;
}

.row-item{
  flex: 1;
  border-right:1px solid #000;
  border-bottom: 1px solid #000;
  text-align: center;
}

.active{
  background-color: pink;
}
</style>