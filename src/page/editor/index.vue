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

    <div id="editor-area" @mousedown="handleMoseDowe">
      <div class="selection-box" :style="selectionBoxRectStyle"></div>

      <AlignmentLine
        v-for="line in alignmentLines"
        :key="line.type"
        :type="line.type"
        :axis="line.axis"
        :length="line.length"
      />

      <Actor
        v-show="!isClip"
        :id="`${item.id}`"
        class="actor"
        v-for="item in actorList"
        :key="item.id"
        :data="item"
        @mousedown.native.stop="handleMousedown($event, item.id)"
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
      @mousedown.native.stop="handleMousedown"
      @upload="multipleUpload"
    />

    <canvas id="my-canvas"></canvas>

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
import AlignmentLine from "./AlignmentLine.vue";
import { ACTOR_LIST } from "./constants.js";
import { OBB, isCollision, Vector2d } from "./Operate/obb";
import { dragAction } from "./Operate/helper";
import { AlignmentLinesHandler } from "./Operate";

export default {
  naem: "EditorTest",

  components: {
    ActorDress,
    Actor,
    Clipping,
    ActorsDress,
    AlignmentLine,
  },

  data() {
    return {
      actorList: ACTOR_LIST,
      selectedIds: [],
      c: null, // 容器
      s: null, // 图片
      m1: null, // 蒙层
      m: null, // 站位图形，保证容器和图片一样大
      layers: [],
      isClip: false,
      selectionBoxRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        angle: 0,
      },
      alignmentLines: [],
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

    selectionBoxRectStyle() {
      const { x, y, width, height } = this.selectionBoxRect;
      return {
        position: "absolute",
        top: y + "px",
        left: x + "px",
        width: width + "px",
        height: height + "px",
      };
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
    multipleUpload(data) {
      data.forEach((item) => {
        const index = this.actorList.findIndex(({ id }) => id === item.id);
        if (index > -1) {
          Object.assign(this.actorList[index], item);
        }
      });
    },

    handleMoseDowe(e) {
      const editorAreaInfo = document
        .getElementById("editor-area")
        .getBoundingClientRect();

      this.selectedIds = [];

      const startPosition = {
        x: e.clientX - editorAreaInfo.x,
        y: e.clientY - editorAreaInfo.y,
      };

      dragAction(e, {
        move: (e) => {
          const currentPosition = {
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          };

          Object.assign(this.selectionBoxRect, {
            x: Math.min(startPosition.x, currentPosition.x),
            y: Math.min(startPosition.y, currentPosition.y),
            width: Math.abs(startPosition.x - currentPosition.x),
            height: Math.abs(startPosition.y - currentPosition.y),
          });
        },
        end: () => {
          this.checkSelect();
          Object.assign(this.selectionBoxRect, {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          });
        },
      });
    },

    checkSelect() {
      const { x, y, width, height } = this.selectionBoxRect;
      const rect1 = new OBB(
        new Vector2d(x + width / 2, y + height / 2),
        width,
        height,
        0
      );

      this.actorList.forEach((actor) => {
        const { x, y, width, height, mask, rotate, id, anchor } = actor;
        const rect2 = new OBB(
          new Vector2d(x + width * anchor.x, y + height * anchor.y),
          mask.width,
          mask.height,
          (rotate * Math.PI) / 180
        );
        const isCollsion = isCollision(rect1, rect2);
        isCollsion && this.selectedIds.push(id);
      });
    },

    handleMousedown(event, id) {
      if (event.shiftKey && id) {
        const isSelected = this.selectedIds.some((item) => item === id);
        !isSelected && this.selectedIds.push(id);
        return;
      }

      if (id) this.selectedIds = [id];

      const alignmentLinesHandler = new AlignmentLinesHandler(
        this.actorList,
        this.selectedIds
      );

      const startMousePosiotn = {
        x: event.clientX,
        y: event.clientY,
      };

      dragAction(event, {
        move: (e) => {
          const moveDistance = {
            x: e.clientX - startMousePosiotn.x,
            y: e.clientY - startMousePosiotn.y,
          };
          const { alignmentLines, targetLeft, targetTop } =
            alignmentLinesHandler.calcHandler(moveDistance);

          this.alignmentLines = alignmentLines;

          this.selectedIds.forEach((item) => {
            const index = this.getIndexById(item);
            const data = this.actorList[index];
            data.x = targetLeft;
            data.y = targetTop;
          });
        },

        end: () => {
          this.alignmentLines = [];
        },
      });
    },

    getIndexById(id) {
      return this.actorList.findIndex((item) => item.id === id);
    },

    handleReverse(type) {
      const index = this.getIndexById(this.selectedIds[0]);
      const data = this.actorList[index];
      if (type === "horizontal") {
        data.scale.x = data.scale.x > 0 ? -1 : 1;
        return;
      }
      data.scale.y = data.scale.y > 0 ? -1 : 1;
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
          const layer = { c, s, m, m1 };
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

.selection-box {
  outline: 2px solid skyblue;
  background: rgba(135, 206, 235, 0.2);
}
</style>