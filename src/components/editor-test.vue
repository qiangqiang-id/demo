<template>
  <div class="box">
    <el-button @click="handleReverse" class="reverse">反转</el-button>
    <el-button @click="changeWidth">增加一个宽度</el-button>

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
import Actor from "../operation/actor.vue";
import ActorDress from "../operation/ActorDress";
import { calcRotatedPoint } from "../operation/drag";
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

    // const reverse = document.querySelector(".reverse");

    setTimeout(() => {
      // reverse && reverse.click();
    }, 100);
  },

  methods: {
    handleMove(index) {
      this.selectedIndex = index;

      document.addEventListener("mousemove", this.handleMousemove);
      document.addEventListener("mouseup", this.handleMouseup);
    },

    handleMousemove(e) {
      const data = this.actorList[this.selectedIndex];

      Object.assign(data, {
        x: data.x + e.movementX,
        y: data.y + e.movementY,
      });
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
        (data.rotate * 180) / Math.PI
      );

      console.log("position", poi);

      Object.assign(data, {
        isReverse: !data.isReverse,
        ...poi,
      });
    },

    updateHandler(newValue) {
      const data = this.actorList[this.selectedIndex];

      Object.assign(data, newValue);

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

        // Setup the position of the bunny

        this.setData(data);

        // Add the bunny to the scene we are building
        this.app.stage.addChild(this.bunny);

        // Listen for frame updates
        this.app.ticker.add(() => {
          // each frame we spin the bunny around a bit
          // bunny.rotation += 0.01;
        });
      });
    },

    setData(data) {
      let { x, y, rotate, scale, isReverse, anchor } = data;
      const angle = rotate * (Math.PI / 180);
      const scaleX = isReverse ? scale.x * -1 : scale.x;

      this.bunny.x = x;
      this.bunny.y = y;
      this.bunny.scale.set(scaleX, scale.y);
      this.bunny.rotation = angle;
      this.bunny.anchor.set(anchor.x, anchor.y);
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