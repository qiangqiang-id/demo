<template>
  <div class="actor-dress" :style="actorDressStyle">
    <div
      class="point"
      v-for="item in pointList"
      :key="item.type"
      @mousedown.stop="dragScale(item.type, $event)"
      :style="{
        position: 'absolute',
        top: data.height * item.position.y + 'px',
        left: data.width * item.position.x + 'px',
        transform: `translate(-50%,-50%)`,
        cursor: item.cursor,
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
</template>


<script>
import {
  ScaleHandler,
  dragAction,
  RotateHandler,
  calcRotatedPoint,
} from "./drag";

const POSITION = {
  leftTop: "leftTop",
  leftBottom: "leftBottom",
  rightTop: "rightTop",
  rightBottom: "rightBottom",
  topCenter: "topCenter",
  bottomCenter: "bottomCenter",
  rotate: "rotate",
};

const pointList = [
  {
    type: POSITION.leftTop,
    cursor: "nwse-resize",
    position: { x: 0, y: 0 },
  },
  {
    type: POSITION.leftBottom,
    cursor: "nesw-resize",
    position: { x: 0, y: 1 },
  },
  {
    type: POSITION.rightTop,
    cursor: "nesw-resize",
    position: { x: 1, y: 0 },
  },
  {
    type: POSITION.rightBottom,
    cursor: "nwse-resize",
    position: { x: 1, y: 1 },
  },
  {
    type: POSITION.topCenter,
    cursor: "ns-resize",
    position: { x: 0.5, y: 0 },
  },
  {
    type: POSITION.bottomCenter,
    cursor: "ns-resize",
    position: { x: 0.5, y: 1 },
  },
];

export default {
  props: {
    data: {
      type: Object,
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
      const scaleHandler = new ScaleHandler(this.data, type);
      dragAction(event, {
        init: () => {
          console.log("init");
        },
        move: (e) => {
          const newPosition = scaleHandler.getAroundScaleData({
            x: e.clientX - this.editorAreaInfo.x,
            y: e.clientY - this.editorAreaInfo.y,
          });

          this.$emit("update", newPosition);
        },
        end: () => {
          console.log("end");
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
          let { x, y, width, height, rotate, isReverse } = this.data;

          if (isReverse) {
            x -= width;
          }

          const poi = calcRotatedPoint(
            {
              x: x + width / 2,
              y: y + height / 2,
            },
            { x: x, y: y },
            rotate
          );

          const data = {
            anchor: { x: 0.5, y: 0.5 },
            ...poi,
          };

          this.$emit("update", data);
        },
        move: (e) => {
          const rotate = rotateHandler.rotateHandler({
            x: e.clientX - this.editorAreaInfo.x,
            y: e.clientY - this.editorAreaInfo.y,
          });

          this.$emit("update", { rotate });
        },

        end: () => {
          let { x, y, width, height, anchor, rotate, isReverse } = this.data;

          const poiX = isReverse ? x + width : x;

          const poi = calcRotatedPoint(
            {
              x: poiX - width * anchor.x,
              y: y - height * anchor.y,
            },
            {
              x: x,
              y: y,
            },
            rotate
          );

          this.$emit("update", {
            x: poi.x, // 定位中心点的x
            y: poi.y, // 定位中心点的y
            width: width,
            height: height,
            anchor: { x: 0, y: 0 },
          });
        },
      });
    },
  },

  computed: {
    actorDressStyle() {
      let newPosition;
      const x = this.editorAreaInfo?.x;
      const y = this.editorAreaInfo?.y;

      const dataY = this.data.y - this.data.height * this.data.anchor.y + y;
      let dataX = this.data.x - this.data.width * this.data.anchor.x + x;

      newPosition = {
        x: dataX,
        y: dataY,
      };

      if (this.data.isReverse && this.data.anchor.y === 0) {
        // dataX -= this.data.width;
        // 还原坐标点
        const ponit = {
          x: this.data.x,
          y: this.data.y,
        };

        const center = {
          x: ponit.x - this.data.width / 2,
          y: ponit.y + this.data.height / 2,
        };

        const newTopReight = calcRotatedPoint(ponit, center, this.data.rotate);
        console.log("newPosition", newTopReight);
        // newTopReight

        newPosition = calcRotatedPoint(
          {
            x: newTopReight.x - this.data.width,
            y: newTopReight.y,
          },
          center,
          -this.data.rotate
        );

        newPosition.x += x;
        newPosition.y += y;
      }

      return {
        position: "absolute",
        top: `${newPosition.y}px`,
        left: `${newPosition.x}px`,
        width: this.data.width + "px",
        height: this.data.height + "px",
        transform: `rotate(${this.data.rotate}deg)`,
        transformOrigin: `${this.data.anchor.x * 100}% ${
          this.data.anchor.y * 100
        }%`,
      };
    },
  },
};
</script>


<style scoped>
.actor-dress {
  pointer-events: none;
}
.point {
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 100%;
  user-select: none;
  cursor: pointer;
  pointer-events: auto;
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
</style>

