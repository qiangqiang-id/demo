<template>
  <div class="box">
    <canvas id="canvas"></canvas>
    <div class="stroke"></div>
  </div>
</template>

<script>
export default {
  name:'stroke',
  data(){
    return {}
  },

  mounted(){
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  const minSize = Math.min(w, h);
  if (r > minSize / 2) r = minSize / 2;
  // 开始绘制
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
    this.draw()
  },

  methods: {
    draw(){
     const canvas =  document.getElementById('canvas')
     const ctx = canvas.getContext('2d')
     const gradient = ctx.createLinearGradient(0,0,canvas.width,0)

     gradient.addColorStop(0,'blue')
     gradient.addColorStop(0.5,'red')
     gradient.addColorStop(1,'yellow')

     canvas.width = 400
     canvas.height = 400

     ctx.save()
    //  ctx.stroke()
     ctx.fillStyle = 'pink'
     ctx.fillRect(0,0,canvas.width,canvas.height)
    //  ctx.stroke()

    //  ctx.lineWidth = 5
    //  ctx.setLineDash([8,16])
    //  ctx.roundRect(0,0,300,200,100)
    //  ctx.stroke()
    //  ctx.beginPath();
    //  ctx.lineWidth = 40
    //  ctx.lineCap = 'round'
    //  ctx.strokeStyle = gradient
    //  ctx.setLineDash([0,16])

    ctx.fillStyle = 'blue'
    ctx.lineWidth = 20
    ctx.ellipse(canvas.width / 2,canvas.height /2,100,100,0,0,2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    ctx.clip()

    ctx.fillStyle = gradient
    ctx.fillRect(100,100,200,200)
    


    // ctx.stroke();


    //  ctx.lineWidth=4;
    //  ctx.setLineDash([8,16])
    //  ctx.strokeRect(100,100,200,200)
     ctx.restore();

    }
  },
}
</script>

<style scoped>

.box{
  display: flex;
}
.stroke{
  /* box-sizing: content-box; */
  width: 200px;
  height: 100px;
  /* background-color: pink; */
  border: 10px dotted #000;
  border-radius: 100%;
}
</style>