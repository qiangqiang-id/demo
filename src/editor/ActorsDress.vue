<template>
  <div class="dress-container">
    <div
      class="actor-item"
      v-for="item in actors"
      @mousedown="$emit('dragMove', $event)"
      :key="item.id"
      :style="{
        left: item.x + item.mask.x + 'px',
        top: item.y + item.mask.y + 'px',
        width: item.mask.width + 'px',
        height: item.mask.height + 'px',
        transform: `rotate(${item.rotate}deg)`,
      }"
    ></div>
    <div
      class="dress-box"
      @mousedown="$emit('dragMove', $event)"
      @click.self="handlerClick"
      :style="dressBoxStyle"
    >
      <!-- 拉伸点 -->
      <div
        class="point"
        v-for="item in pointList"
        :key="item.type"
        @mousedown.stop="dragScale(item.type, $event)"
        :style="{
          position: 'absolute',
          top: getData.height * item.position.y + 'px',
          left: getData.width * item.position.x + 'px',
          transform: `translate(-50%,-50%)`,
          cursor: cursorStyle[item.cursorType],
        }"
      ></div>
      <!-- 旋转区域 -->
      <div
        class="rotateArea"
        :style="{
          position: 'absolute',
          left: getData.width / 2 + 'px',
          top: getData.height + 10 + 'px',
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
import { POINT_LIST, POSITION, INIT_ANGLE, ANGLE_CURSOR } from "./constants";
import { calcRotatedPoint, dragAction } from "./drag";
import MultipleScale from "./multipleScale";
export default {
  props: {
    actors: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      rotate: 0,
    };
  },

  computed: {
    pointList() {
      const showList = [
        POSITION.leftTop,
        POSITION.rightTop,
        POSITION.leftBottom,
        POSITION.rightBottom,
      ];
      return POINT_LIST.filter((item) => showList.includes(item.type));
    },

    dressBoxStyle() {
      const { x, y, width, height } = this.getData;
      return {
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
      };
    },

    getData() {
      const topList = [];
      const leftList = [];
      const rightList = [];
      const bottomList = [];
      this.actors.forEach(({ x, y, rotate, mask }) => {
        const topLeft = {
          x: x + mask.x,
          y: y + mask.y,
        };

        const rightBottom = {
          x: topLeft.x + mask.width,
          y: topLeft.y + mask.height,
        };

        const topRight = {
          x: topLeft.x + mask.width,
          y: topLeft.y,
        };

        const leftBottom = {
          x: topLeft.x,
          y: topLeft.y + mask.height,
        };

        const center = {
          x: topLeft.x + mask.width / 2,
          y: topLeft.y + mask.height / 2,
        };

        const rotatedTopLeft = calcRotatedPoint(topLeft, center, rotate);
        const rotatedRigthBottom = calcRotatedPoint(
          rightBottom,
          center,
          rotate
        );
        const rotateTopRight = calcRotatedPoint(topRight, center, rotate);
        const rotateLeftBottom = calcRotatedPoint(leftBottom, center, rotate);

        const xAixs = [
          rotatedTopLeft.x,
          rotatedRigthBottom.x,
          rotateLeftBottom.x,
          rotateTopRight.x,
        ];

        const yAixs = [
          rotatedTopLeft.y,
          rotateTopRight.y,
          rotatedRigthBottom.y,
          rotateLeftBottom.y,
        ];

        topList.push(Math.min(...yAixs));
        bottomList.push(Math.max(...yAixs));
        leftList.push(Math.min(...xAixs));
        rightList.push(Math.max(...xAixs));
      });

      const x = Math.min(...leftList);
      const y = Math.min(...topList);
      const width = Math.max(...rightList) - x;
      const height = Math.max(...bottomList) - y;
      return {
        x,
        y,
        width,
        height,
      };
    },

    cursorStyle() {
      let angle = this.rotate;
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
    dragRotate() {
      console.log("旋转");
    },

    dragScale(type, e) {
      const editorAreaInfo = document
        .getElementById("editor-area")
        .getBoundingClientRect();

      const multipleScale = new MultipleScale(
        this.getData,
        type,
        this.actors,
        this.rotate
      );
      dragAction(e, {
        init: () => {},
        move: (e) => {
          const data = multipleScale.handlerScale({
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          });
          this.$emit('upload',data)
        },
        end: () => {},
      });
    },

    handlerClick() {
      console.log("handlerClick");
    },
  },
};
</script>


<style scoped>
.dress-container {
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

.dress-box {
  outline: 2px dashed skyblue;
}

.dress-box {
  pointer-events: auto;
}

.actor-item {
  position: absolute;
  outline: 2px solid skyblue;
  pointer-events: auto;
  z-index: 1;
}

.point {
  z-index: 3;
}

.rotateArea {
  cursor: url(https://cdn.dancf.com/design/svg/ic_mouse_rotation_0.f800a9a2.svg)
      11 9,
    pointer;
}
</style>