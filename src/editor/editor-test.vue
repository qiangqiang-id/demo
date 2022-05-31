<template>
  <div class="box">
    <el-button @click="handleReverse('horizontal')" class="reverse"
      >左右反转</el-button
    >
    <el-button @click="handleReverse('vertical')" class="reverse"
      >上下反转</el-button
    >

    <el-button @click="actorList[0].rotate += 2">旋转</el-button>

    <el-button @click.stop="handleClip">裁剪</el-button>

    <div id="editor-area" @mousedown="clearSelected">
      <Actor
        v-show="!isClip"
        :id="`${item.id}`"
        class="actor"
        v-for="item in actorList"
        :key="item.id"
        :data="item"
        @mousedown.native.stop="handleMousedown(item.id, $event)"
      />
    </div>
    <ActorDress
      v-if="!isClip && selectedIds.length === 1"
      @update="updateHandler"
      :data="selectedData"
    />

    <ActorsDress
      v-if="isMultiple"
      :actors="selectedData"
      @dragMove="dragMove"
      @upload="multipleUpload"
    />

    <canvas v-show="!isClip" id="my-canvas"></canvas>

    <Clipping
      v-if="isClip"
      :data="selectedData"
      @closeClip="closeClip"
      @update="updateHandler"
    />
  </div>
</template>


<script>
import * as PIXI from "pixi.js";
import Actor from "./actor.vue";
import ActorDress from "./ActorDress";
import ActorsDress from "./ActorsDress";
import Clipping from "./Clipping.vue";
import { ACTOR_LIST } from "./constants.js";

export default {
  naem: "EditorTest",

  components: {
    ActorDress,
    Actor,
    Clipping,
    ActorsDress,
  },

  data() {
    return {
      actorList: ACTOR_LIST,
      selectedIds: [1, 2],
      c: null, // 容器
      s: null, // 图片
      m1: null, // 蒙层
      m: null, // 站位图形，保证容器和图片一样大
      layers: [],
      isClip: false,
    };
  },

  computed: {
    selectedData() {
      if (this.isMultiple) {
        return this.selectedIds.map((id) => {
          return this.actorList.find((item) => item.id === id);
        });
      }
      let index = this.getIndexById(this.selectedIds[0]);
      return this.actorList[index];
    },

    isMultiple() {
      return this.selectedIds.length > 1;
    },
  },

  watch: {
    actorList: {
      handler(data) {
        if (!data) return;
        if (this.isMultiple) {
          data.forEach((item, index) => {
            const layer = this.layers[index];
            this.setData(item, layer);
          });
          return;
        }
        const index = data.findIndex(({ id }) => this.selectedIds[0] === id);
        if (index > -1) {
          const layer = this.layers[index];
          this.setData(data[index], layer);
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.runPixi();
  },

  methods: {
    multipleUpload(data){
      data.forEach((item)=>{
        const index = this.actorList.findIndex(({id})=>id === item.id)
        if(index > -1) {
          Object.assign(this.actorList[index],item)
        }
      })
    },
     
    clearSelected() {
      this.selectedIds = [];
    },

    handleMousedown(id, event) {
      if (event.shiftKey) {
        const isSelected = this.selectedIds.some((item) => item === id);
        !isSelected && this.selectedIds.push(id);
      } else {
        this.selectedIds = [id];
      }

      this.dragMove();
    },

    dragMove() {
      document.addEventListener("mousemove", this.handleMousemove);
      document.addEventListener("mouseup", this.handleMouseup);
    },

    handleMousemove(e) {
      this.selectedIds.forEach((item) => {
        const index = this.getIndexById(item);
        const data = this.actorList[index];
        data.x += e.movementX;
        data.y += e.movementY;
      });
    },

    getIndexById(id) {
      return this.actorList.findIndex((item) => item.id === id);
    },

    handleMouseup() {
      document.removeEventListener("mousemove", this.handleMousemove);
      document.removeEventListener("mouseup", this.handleMouseup);
    },

    handleReverse(type) {
      const index = this.getIndexById(this.selectedIds[0]);
      const data = this.actorList[index];
      if (type === "horizontal") {
        data.scale.x = data.scale.x > 0 ? -1 : 1;
      } else {
        data.scale.y = data.scale.y > 0 ? -1 : 1;
      }
    },

    updateHandler(newValue, maskValue) {
      const index = this.getIndexById(this.selectedIds[0]);
      const data = this.actorList[index];
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
      const urlList = [];
      this.actorList.forEach((actor) => {
        urlList.push(actor.url);
      });
      this.app.loader.add(urlList).load((loader, resources) => {
        Object.keys(resources).forEach((key, index) => {
          const texture = resources[key].texture;
          const c = new PIXI.Container();
          const s = new PIXI.Sprite(texture);

          const data = this.actorList[index];
          const m = new PIXI.Graphics();
          m.beginFill(0xff0000);
          m.drawRect(0, 0, data.width, data.height);
          m.endFill();
          m.alpha = 0;

          const m1 = new PIXI.Graphics();
          m1.beginFill(0xff002123);
          m1.drawRect(
            data.mask.x,
            data.mask.y,
            data.mask.width,
            data.mask.height
          );
          m1.endFill();

          c.addChild(s);
          c.addChild(m1);
          c.addChild(m);
          s.mask = m1;
          const layer = {
            c,
            s,
            m,
            m1,
          };
          this.setData(data, layer);
          this.app.stage.addChild(c);
          this.layers.push(layer);
        });
      });
    },

    setData(data, layer) {
      let { rotate, mask, width, height, x, y, scale } = data;
      let { c, s, m1, m } = layer;

      // 容器设置
      const pivotX = mask.x + mask.width / 2;
      const pivotY = mask.y + mask.height / 2;
      const c1X = x + pivotX;
      const c1Y = y + pivotY;
      c.angle = rotate;
      c.pivot.set(pivotX, pivotY);
      c.position.set(c1X, c1Y);
      c.scale.set(scale.x, scale.y);

      m.width = width;
      m.height = height;

      s.width = width;
      s.height = height;
      // 设置mask
      m1.width = mask.width;
      m1.height = mask.height;
      m1.position.set(mask.x, mask.y);
    },

    handleClip() {
      this.isClip = true;
    },

    closeClip() {
      this.isClip = false;
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