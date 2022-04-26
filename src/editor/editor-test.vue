<template>
  <div class="box">
    <el-button @click="handleReverse('horizontal')" class="reverse"
      >左右反转</el-button
    >
    <el-button @click="handleReverse('vertical')" class="reverse"
      >上下反转</el-button
    >

    <el-button @click="actorList[0].rotate += 2">旋转</el-button>

    <div id="editor-area">
      <Actor
        :id="`${item.id}`"
        class="actor"
        v-for="(item, index) in actorList"
        :key="item.id"
        :data="item"
        @mousedown.native="handleMove(index, $event)"
      />
    </div>

    <ActorDress @update="updateHandler" :data="selectedData" />

    <canvas id="my-canvas"></canvas>
  </div>
</template>


<script>
import * as PIXI from "pixi.js";
import Actor from "./actor.vue";
import ActorDress from "./ActorDress";
const actorList = [
  {
    id: 2,
    x: 0,
    y: 0,
    width: 400,
    height: 267,
    originWidth: 400,
    originHeight: 267,
    rotate: 0,
    url: "https://st0.dancf.com/gaoding-material/0/images/223463/20191107-203726-aUYH9.jpg",
    scale: {
      x: 1,
      y: 1,
    },
    anchor: {
      x: 0,
      y: 0,
    },
    mask: {
      x: 0,
      y: 0,
      width: 400,
      height: 267,
    },
  },
];

export default {
  naem: "EditorTest",

  components: {
    ActorDress,
    Actor,
  },

  data() {
    return {
      actorList,
      selectedIndex: 0,
      c1: null, // 容器
      s1: null, // 图片
      m1: null, // 蒙层
      m: null, // 站位图形，保证容器和图片一样大
    };
  },

  computed: {
    selectedData() {
      return this.actorList[this.selectedIndex];
    },

    actorStyle() {
      return {};
    },
  },

  watch: {
    "actorList.0": {
      handler(data) {
        data && this.setData(data);
      },
      deep: true,
    },
  },

  mounted() {
    this.runPixi();
  },

  methods: {
    handleMove(index) {
      this.selectedIndex = index;
      document.addEventListener("mousemove", this.handleMousemove);
      document.addEventListener("mouseup", this.handleMouseup);
    },

    handleMousemove(e) {
      const data = this.actorList[this.selectedIndex];
      data.x += e.movementX;
      data.y += e.movementY;
    },

    handleMouseup() {
      document.removeEventListener("mousemove", this.handleMousemove);
      document.removeEventListener("mouseup", this.handleMouseup);
    },

    handleReverse(type) {
      const data = this.actorList[this.selectedIndex];
      if (type === "horizontal") {
        data.scale.x = data.scale.x > 0 ? -1 : 1;
      } else {
        data.scale.y = data.scale.y > 0 ? -1 : 1;
      }
    },

    updateHandler(newValue, maskValue) {
      const data = this.actorList[this.selectedIndex];
      Object.assign(data, newValue);
      maskValue && Object.assign(data.mask, maskValue);
    },

    runPixi() {
      const container = document.querySelector("#my-canvas");

      this.app = new PIXI.Application({
        width: 800,
        height: 800,
        antialias: false,
        backgroundAlpha: 0,
        resolution: 1,
        preserveDrawingBuffer: true,
        view: container,
      });
      const data = this.actorList[this.selectedIndex];

      this.app.loader.add("bunny", data.url).load((loader, resources) => {
        this.c1 = new PIXI.Container();
        this.s1 = new PIXI.Sprite(resources.bunny.texture);

        this.m = new PIXI.Graphics();
        this.m.beginFill(0xff0000);
        this.m.drawRect(0, 0, data.width, data.height);
        this.m.endFill();
        this.m.alpha = 0;

        this.m1 = new PIXI.Graphics();
        this.m1.beginFill(0xff002123);
        this.m1.drawRect(
          data.mask.x,
          data.mask.y,
          data.mask.width,
          data.mask.height
        );
        this.m1.endFill();

        this.c1.addChild(this.s1);
        this.c1.addChild(this.m1);
        this.c1.addChild(this.m);
        this.s1.mask = this.m1;

        this.setData(data);
        this.app.stage.addChild(this.c1);
      });
    },

    setData(data) {
      let { rotate, mask, width, height, x, y, scale } = data;

      // 容器设置
      const pivotX = mask.x + mask.width / 2;
      const pivotY = mask.y + mask.height / 2;
      const c1X = x + pivotX;
      const c1Y = y + pivotY;
      this.c1.angle = rotate;
      this.c1.pivot.set(pivotX, pivotY);
      this.c1.position.set(c1X, c1Y);
      this.c1.scale.set(scale.x, scale.y);

      this.m.width = width;
      this.m.height = height;

      this.s1.width = width;
      this.s1.height = height;

      // 设置mask
      this.m1.width = mask.width;
      this.m1.height = mask.height;
      this.m1.position.set(mask.x, mask.y);
    },
  },
};
</script>


<style scoped >
.box {
  height: 100vh;
}

#editor-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  z-index: 1;
  box-shadow: inset 0 -3em 3em rgba(0, 0, 0, 0.1), 0 0 0 2px rgb(255, 255, 255),
    0.3em 0.3em 1em rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  overflow: hidden;
}

.container {
  box-sizing: border-box;
  cursor: move;
}

#my-canvas {
  width: 800px;
  height: 800px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>