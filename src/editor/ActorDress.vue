<template>
  <div class="dress-container">
    <div class="actor-dress-mask" :style="actorDressStyleMask">
      <div
        class="point mask-point"
        v-for="item in pointList"
        :key="item.type"
        @mousedown.stop="dragScale(item.type, $event)"
        :style="{
          position: 'absolute',
          top: data.height * item.position.y + 'px',
          left: data.width * item.position.x + 'px',
          transform: `translate(-50%,-50%)`,
          cursor: cursorStyle[item.cursorType],
        }"
      />

      <!-- 旋转区域 -->
      <div
        class="rotateArea"
        :style="{
          position: 'absolute',
          left: data.width / 2 + 'px',
          top: data.height + 10 + 'px',
          transform: `translateX(-50%)`,
        }"
        @mousedown.stop="dragRotate"
      >
        <img src="../assets/icon_rotate.png" alt="rotateIcon" />
      </div>
    </div>
  </div>
</template>


<script>
import {
  ScaleHandler,
  dragAction,
  RotateHandler,
  calcRotatedPoint,
} from "./drag";

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
    };
  },

  mounted() {
    this.editorAreaInfo = document
      .getElementById("editor-area")
      .getBoundingClientRect();
  },

  methods: {
    dragScale(type, event) {
      const scaleHandler = new ScaleHandler(this.data, type, true);

      const cneterPoint = [
        POSITION.topCenter,
        POSITION.leftCenter,
        POSITION.rightCenter,
        POSITION.bottomCenter,
      ];

      dragAction(event, {
        init: () => {
          // const [data, maskData] = this.repositionAnchor();
          // this.$emit("update", data, maskData);
        },

        move: (e) => {
          // let newPosition = {},
          let maskPosition = {};

          maskPosition = scaleHandler.getAroundScaleData({
            x: e.x - this.editorAreaInfo.x,
            y: e.y - this.editorAreaInfo.y,
          });

          console.log("maskPosition", maskPosition);

          if (!cneterPoint.includes(type)) {
            // newPosition = this.resizeForAroundScale(maskPosition);
          } else {
            // newPosition = this.resizeForCenterScale(maskPosition);
          }

          this.$emit("update", maskPosition, maskPosition);
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

    resizeForAroundScale(maskPosition) {
      const { mask, width, height } = this.data;

      const rateW = maskPosition.width / mask.width;
      const rateH = maskPosition.height / mask.height;

      return {
        x: maskPosition.x,
        y: maskPosition.y,
        width: width * rateW,
        height: height * rateH,
      };
    },

    resizeForCenterScale() {},

    // 图片的旋转锚点是以mask的为标准，需要手动计算
    getAnchor() {
      const { x, y, width, height, mask, rotate, isReverse } = this.data;

      //中心点
      const center = {
        x: mask.x + mask.width / 2,
        y: mask.y + mask.height / 2,
      };

      let poiPosition = {
        x,
        y,
      };

      let maskPosition = {
        x: mask.x,
        y: mask.y,
      };

      if (isReverse) {
        const data = this.resetPosition();
        poiPosition = data[0];
        maskPosition = data[1];
      }

      // 还原图片位置
      const poi = calcRotatedPoint(
        {
          x: poiPosition.x,
          y: poiPosition.y,
        },
        center,
        -rotate
      );

      // 还原mask位置
      const maskPoi = calcRotatedPoint(
        { x: maskPosition.x, y: maskPosition.y },
        center,
        -rotate
      );

      // 还原之后计算锚点
      const originCenter = {
        x: maskPoi.x + mask.width / 2,
        y: maskPoi.y + mask.height / 2,
      };

      const diffW = originCenter.x - poi.x;
      const diffH = originCenter.y - poi.y;

      //todo：锚点是否也需要翻转？如果需要如何翻转？
      let anchorX = diffW / width;

      // if (isReverse) {
      //   const diff = width - mask.width;
      //   const rate = diff / width / 2;
      //   console.log("diff", diff, rate);
      //   anchorX = anchorX + rate;
      // }

      // console.log(anchorX, diffW / width);
      return {
        x: anchorX,
        y: diffH / height,
      };
    },

    // 如果发生了翻转，需要回正图形，再减掉翻转加上的宽度，在进行旋转，得到坐标。
    resetPosition() {
      const { x, y, mask, rotate, width } = this.data;

      const center = {
        x: mask.x + mask.width / 2,
        y: mask.y + mask.height / 2,
      };

      // 回正mask
      const correctMask = calcRotatedPoint(
        { x: mask.x, y: mask.y },
        center,
        -rotate
      );

      // 减去width 旋转mask
      const rMask = calcRotatedPoint(
        {
          x: correctMask.x - mask.width,
          y: correctMask.y,
        },
        {
          x: correctMask.x + mask.width / 2,
          y: correctMask.y + mask.height / 2,
        },
        rotate
      );

      // 回正
      const correctPoi = calcRotatedPoint({ x, y }, center, -rotate);
      // 减去width 再旋转
      const r = calcRotatedPoint(
        { x: correctPoi.x - width, y: correctPoi.y },
        {
          x: correctMask.x + mask.width / 2,
          y: correctMask.y + mask.height / 2,
        },
        rotate
      );

      return [r, rMask];
    },
  },

  computed: {
    actorDressStyleMask() {
      const data = this.data;
      const mask = data.mask;
      let newPosition = {
        x: mask.x,
        y: mask.y,
      };

      // if (mask.anchor.y !== 0) {
      //   newPosition = {
      //     x: mask.x - mask.width * mask.anchor.x,
      //     y: mask.y - mask.height * mask.anchor.y,
      //   };
      // }

      // if (data.isReverse && mask.anchor.y === 0) {
      //   const x = mask.x - mask.width;

      //   newPosition = calcRotatedPoint(
      //     {
      //       x: x,
      //       y: mask.y,
      //     },
      //     {
      //       x: mask.x,
      //       y: mask.y,
      //     },
      //     data.rotate
      //   );
      // }

      return {
        position: "absolute",
        top: `${newPosition.y}px`,
        left: `${newPosition.x}px`,
        width: mask.width + "px",
        height: mask.height + "px",
        transform: `rotate(${data.rotate}deg)`,
        // transformOrigin: `${mask.anchor.x * 100}% ${mask.anchor.y * 100}%`,
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
  outline: 2px solid red;
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

