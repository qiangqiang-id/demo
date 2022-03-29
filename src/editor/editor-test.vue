<template>
  <div class="box">
    <el-button @click="handleReverse" class="reverse">反转</el-button>

    <el-button @click="generateImage">生成图片</el-button>

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

    <div class="my-canvas"></div>
  </div>
</template>


<script>
import * as PIXI from "pixi.js";
import Actor from "./actor.vue";
import ActorDress from "./ActorDress";
import { calcRotatedPoint } from "./drag";
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
    isReverse: false,
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
      anchor: {
        x: 0,
        y: 0,
      },
    },
  },
];

export default {
  naem: "textInput",

  components: {
    ActorDress,
    Actor,
  },

  data() {
    return {
      actorList,
      selectedIndex: 0,
      thing: null,
      s1: null,
      ObservePoint: null,
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
    generateImage() {
      const canvas = document
        .querySelector(".my-canvas")
        .querySelector("canvas");

      const base64 = canvas.toDataURL();

      console.log(base64, canvas);
      // const data = { base64: base64 }

      const fromData = new fromData();
      fromData.append("base64", base64);
      window.navigator.sendBeacon("http://localhost:8083", fromData);
    },

    handleMove(index) {
      this.selectedIndex = index;

      document.addEventListener("mousemove", this.handleMousemove);
      document.addEventListener("mouseup", this.handleMouseup);
    },

    handleMousemove(e) {
      const data = this.actorList[this.selectedIndex];

      const x = data.x + e.movementX;
      const y = data.y + e.movementY;

      Object.assign(data, {
        x,
        y,
      });

      data.mask.x += e.movementX;
      data.mask.y += e.movementY;
    },

    handleMouseup() {
      document.removeEventListener("mousemove", this.handleMousemove);
      document.removeEventListener("mouseup", this.handleMouseup);
    },

    handleReverse() {
      const data = this.actorList[this.selectedIndex];

      data.isReverse = !data.isReverse;

      // const x = !data.isReverse ? data.x + data.width : data.x - data.width;
      // const poi = calcRotatedPoint(
      //   {
      //     x: x,
      //     y: data.y,
      //   },
      //   {
      //     x: data.x,
      //     y: data.y,
      //   },
      //   data.rotate
      // );

      // const mask = data.mask;
      // const maskX = !data.isReverse ? mask.x + mask.width : mask.x - mask.width;
      // const maskPoi = calcRotatedPoint(
      //   {
      //     x: maskX,
      //     y: mask.y,
      //   },
      //   {
      //     x: mask.x,
      //     y: mask.y,
      //   },
      //   data.rotate
      // );

      // Object.assign(data, {
      //   isReverse: !data.isReverse,
      //   ...poi,
      // });

      // Object.assign(mask, { ...maskPoi });
    },

    updateHandler(newValue, maskValue) {
      const data = this.actorList[this.selectedIndex];

      Object.assign(data, newValue);
      maskValue && Object.assign(data.mask, maskValue);

      data.scale = {
        x: data.width / data.originWidth,
        y: data.height / data.originHeight,
      };
    },

    changeWidth() {
      const data = this.actorList[this.selectedIndex];
      data.x += data.width;
    },

    runPixi() {
      const container = document.querySelector(".my-canvas");

      this.app = new PIXI.Application({
        width: 800,
        height: 800,
        antialias: false,
        transparent: true,
        resolution: 1,
        preserveDrawingBuffer: true,
      });
      container.appendChild(this.app.view);
      const data = this.actorList[this.selectedIndex];

      this.app.loader.add("bunny", data.url).load((loader, resources) => {
        this.c1 = new PIXI.Container();
        this.s1 = new PIXI.Sprite(resources.bunny.texture);

        this.setData(data);
        this.c1.addChild(this.s1);
        this.app.stage.addChild(this.c1);
      });
    },

    setData(data) {
      let { rotate, scale, isReverse, width, height } = data;
      const scaleX = isReverse ? -scale.x : scale.x;

      // 设置属性
      this.s1.scale.set(scaleX, scale.y);

      // 容器设置
      this.c1.pivot.set(width / 2, height / 2);
      this.c1.angle = rotate;
      const { x, y } = this.toPositionData();
      this.c1.position.set(x + width / 2, y + height / 2);
    },

    toPositionData() {
      const data = this.actorList[this.selectedIndex];
      if (data.isReverse) {
        const x = data.x + data.width;
        return calcRotatedPoint(
          {
            x: x,
            y: data.y,
          },
          {
            x: data.x,
            y: data.y,
          },
          data.rotate
        );
      }

      return {
        x: data.x,
        y: data.y,
      };
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
}

.container {
  box-sizing: border-box;
  cursor: move;
}

.my-canvas {
  width: 800px;
  height: 800px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>