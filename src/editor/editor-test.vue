<template>
  <div class="box">
    <el-button @click="handleReverse" class="reverse">反转</el-button>

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
    id: 1,
    x: 0,
    y: 0,
    width: 400,
    height: 267,
    originWidth: 400,
    originHeight: 267,
    rotate: 0,
    color: "blue",
    // 是否翻转
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
      selectedIndex: 1,
      thing: null,
      bunny: null,
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
    "actorList.1": {
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
      const x = !data.isReverse ? data.x + data.width : data.x - data.width;
      const poi = calcRotatedPoint(
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

      const mask = data.mask;
      const maskX = !data.isReverse ? mask.x + mask.width : mask.x - mask.width;
      const maskPoi = calcRotatedPoint(
        {
          x: maskX,
          y: mask.y,
        },
        {
          x: mask.x,
          y: mask.y,
        },
        data.rotate
      );

      Object.assign(data, {
        isReverse: !data.isReverse,
        ...poi,
      });

      Object.assign(mask, { ...maskPoi });
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
        width: 500,
        height: 500,
        antialias: false,
        transparent: false,
        resolution: 1,
      });

      container.appendChild(this.app.view);

      const data = this.actorList[1];

      this.app.loader.add("bunny", data.url).load((loader, resources) => {
        // console.log(loader, resources);
        // This creates a texture from a 'bunny.png' image
        this.bunny = new PIXI.Sprite(resources.bunny.texture);
        this.thing = new PIXI.Sprite(resources.bunny.texture);
        this.container = new PIXI.Container();

        // this.bunny.mask = this.thing;

        this.bunny.filters = [new PIXI.SpriteMaskFilter(this.thing)];

        // this.thing.rotation = 30 * (Math.PI / 180);
        this.setData(data);

        // this.container.addChild(this.bunny);
        // Add the bunny to the scene we are building
        this.app.stage.addChild(this.bunny);

        // Listen for frame updates
        this.app.ticker.add(() => {
          // each frame we spin the bunny around a bit
          // bunny.rotation += 0.01;
        });
      });
    },

    setData() {
      // let { height, width, x, y, rotate, scale, isReverse, anchor } = data;
      // const rotation = rotate * (Math.PI / 180);
      // const scaleX = isReverse ? -scale.x : scale.x;
      // const originX = x + width * anchor.x;
      // const originY = y + height * anchor.y;
      // 设置容器
      // this.container.x = x;
      // this.container.y = y;
      // this.container.position.set(x, y);
      // this.container.width = width;
      // this.container.height = height;
      // this.container.rotation = rotation;
      // this.container.pivot = this.ObservePoint;
      // this.container.pivot.y = anchor.y;
      // 设置属性
      // this.bunny.position.set(x, y);
      // this.bunny.anchor.set(anchor.x, anchor.y);
      // this.bunny.scale.set(scaleX, scale.y);
      // this.bunny.rotation = rotation;
      // 图形设置
      // this.thing.clear();
      // this.thing.beginFill(0xff3300);
      // this.thing.rotation = rotation;
      // 设置pivot drawRect的x，y不生效
      // this.thing.pivot.x = originX;
      // this.thing.pivot.y = originY;
      // this.thing.x = x;
      // this.thing.y = y;
      // this.thing.drawRect(x, y, width, height);
      // this.thing.lineStyle(5, 0xff0000);
      // this.thing.endFill();
      // this.bunny.alpha = 1;
      // this.bunny.thing = 0;
      // this.thing.position.set(x, y);
      // this.thing.anchor.set(anchor.x, anchor.y);
      // this.thing.scale.set(scaleX, scale.y);
      // this.thing.rotation = rotation;
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
  top: 30%;
  /* left: 50%; */
  /* transform: translate(-50%, -50%); */
  width: 500px;
  height: 500px;
  background-color: salmon;
}

.container {
  box-sizing: border-box;
  cursor: move;
}

.my-canvas {
  width: 500px;
  height: 500px;
  position: absolute;
  top: 30%;
  right: 0;
  background-color: blue;
}
</style>