<template>
  <div class="dress-container">
    <div class="actor-dress" :style="actorDressStyle">
      <div class="actor-dress-mask" :style="actorDressStyleMask">
        <div
          class="point mask-point"
          v-for="item in pointList"
          :key="item.type"
          @mousedown.stop="dragScale(item.type, $event)"
          :style="{
            position: 'absolute',
            top: data.mask.height * item.position.y + 'px',
            left: data.mask.width * item.position.x + 'px',
            transform: `translate(-50%,-50%)`,
            cursor: cursorStyle[item.cursorType],
          }"
        />

        <!-- 旋转区域 -->
        <div
          class="rotateArea"
          :style="{
            position: 'absolute',
            left: data.mask.width / 2 + 'px',
            top: data.mask.height + 10 + 'px',
            transform: `translateX(-50%)`,
          }"
          @mousedown.stop="dragRotate"
        >
          <img src="../assets/icon_rotate.png" alt="rotateIcon" />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { dragAction, RotateHandler } from "./drag";
import { MaskScale } from "./maskScale";

import { pointList, POSITION, INIT_ANGLE, ANGLE_CURSOR } from "./constants";

export default {
  props: {
    data: {
      type: Object,
    },

    isCuting: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      pointList,
      type: undefined,
      POSITION,
      editorAreaInfo: null,
      startImageData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },

      startData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  },

  mounted() {
    this.editorAreaInfo = document
      .getElementById("editor-area")
      .getBoundingClientRect();
  },

  methods: {
    dragScale(type, event) {
      const maskScale = new MaskScale(this.data, type);

      dragAction(event, {
        init: () => {
          // const [data, maskData] = this.repositionAnchor();
          // this.$emit("update", data, maskData);
        },

        move: (e) => {
          const { maskData, rectData } = maskScale.handleScale(
            {
              x: e.x - this.editorAreaInfo.x,
              y: e.y - this.editorAreaInfo.y,
            },
            type
          );

          this.$emit("update", rectData, maskData);
        },

        end: () => {
          // const [data, maskData] = this.repositionRegular();
          // this.$emit("update", data, maskData);
        },
      });
    },

    dragRotate(e) {
      const initData = {
        startRotate: this.data.rotate,
        startX: e.clientX - this.editorAreaInfo.x,
        startY: e.clientY - this.editorAreaInfo.y,
        centerX: this.data.x + this.data.width / 2,
        centerY: this.data.y + this.data.height / 2,
      };

      const rotateHandler = new RotateHandler(initData);

      dragAction(event, {
        init: () => {
          // const [data, maskData] = this.repositionAnchor();
          // this.$emit("update", data, maskData);
        },

        move: (e) => {
          const rotate = rotateHandler.rotateHandler({
            x: e.clientX - this.editorAreaInfo.x,
            y: e.clientY - this.editorAreaInfo.y,
          });

          this.$emit("update", { rotate });
        },

        end: () => {
          // const [data, maskData] = this.repositionRegular();
          // this.$emit("update", data, maskData);
        },
      });
    },
  },

  computed: {
    actorDressStyle() {
      const data = this.data;
      const mask = data.mask;

      const rateX = (data.x + mask.x + mask.width / 2 - data.x) / data.width;
      const rateY = (data.y + mask.y + mask.height / 2 - data.y) / data.height;

      return {
        position: "absolute",
        top: `${data.y}px`,
        left: `${data.x}px`,
        width: data.width + "px",
        height: data.height + "px",
        transform: `rotate(${data.rotate}deg)`,
        transformOrigin: `${rateX * 100}% ${rateY * 100}%`,
      };
    },

    actorDressStyleMask() {
      const data = this.data.mask;
      return {
        position: "absolute",
        top: `${data.y}px`,
        left: `${data.x}px`,
        width: data.width + "px",
        height: data.height + "px",
      };
    },

    cursorStyle() {
      let angle = this.data.rotate;
      const cursors = [];
      if (angle < 0) {
        angle += 360;
      }

      INIT_ANGLE.forEach((a) => {
        const newAngle = (a + angle) % 360;
        const item = ANGLE_CURSOR.find(
          (i) => i.start <= newAngle && i.end >= newAngle
        );
        item && cursors.push(item.cursor);
      });
      return cursors;
    },
  },
};
</script>


<style scoped>
.actor-dress {
  pointer-events: none;
  /* outline: 2px solid red; */
}
.point {
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 100%;
  user-select: none;
  cursor: pointer;
  pointer-events: auto;
  border: 2px solid #eee;
}
.rotateArea {
  cursor: url(https://cdn.dancf.com/design/svg/ic_mouse_rotation_0.f800a9a2.svg)
      11 9,
    pointer;
  pointer-events: auto;
}

img {
  -webkit-user-drag: none;
}

.dress-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  pointer-events: none;
  z-index: 2;
}

.mask-point {
  background-color: #fff;
}

.actor-dress-mask {
  outline: 2px solid skyblue;
}
</style>

