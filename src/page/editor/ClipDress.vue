<template>
  <div class="clip-dress-container">
    <div class="clip-dress-box" :style="clipDressStyle">
      <div
        class="point"
        v-for="item in pointList"
        :key="item.type"
        @mousedown.stop="dragScale(item.type, $event)"
        :style="{
          position: 'absolute',
          top: maskData.height * item.position.y + 'px',
          left: maskData.width * item.position.x + 'px',
          transform: `translate(-50%,-50%)`,
          cursor: cursorStyle[item.cursorType],
        }"
      />
    </div>
  </div>
</template>

<script>
import { dragAction } from "./Operate/helper";
import { POINT_LIST, INIT_ANGLE, ANGLE_CURSOR } from "./constants";
import { MasKScale } from "./Operate";
export default {
  props: {
    data: {
      type: Object,
    },

    maskData: {
      type: Object,
    },
  },

  data() {
    return {
      pointList: POINT_LIST,
    };
  },

  computed: {
    clipDressStyle() {
      const { x, y, rotate, width, height } = this.maskData;
      return {
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        width: width + "px",
        height: height + "px",
        transform: `rotate(${rotate}deg)`,
      };
    },

    cursorStyle() {
      let angle = this.maskData.rotate;
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

  methods: {
    dragScale(type, event) {
      const maskScale = new MasKScale(this.data, this.maskData, type);

      const editorAreaInfo = document
        .getElementById("editor-area")
        .getBoundingClientRect();

      dragAction(event, {
        init: () => {},
        move: (e) => {
          const data = maskScale.handlerScale({
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          });

          data && this.$emit("update", data);
        },
        end: () => {},
      });
    },
  },
};
</script>

<style>
.clip-dress-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
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
  background-color: #fff;
}
</style>