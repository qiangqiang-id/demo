<template>
  <div class="dress-container">
    <div
      class="actor-item"
      v-for="item in actors"
      @mousedown="dragMove"
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
      @mousedown="dragMove"
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
          top: rectData.height * item.position.y + 'px',
          left: rectData.width * item.position.x + 'px',
          transform: `translate(-50%,-50%)`,
          cursor: cursorStyle[item.cursorType],
        }"
      ></div>
      <!-- 旋转区域 -->
      <div
        class="rotateArea"
        :style="{
          position: 'absolute',
          left: rectData.width / 2 + 'px',
          top: rectData.height + 10 + 'px',
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
import { RotateHandler } from "./drag";
import { calcRotatedPoint, dragAction } from "./helper";
import MultipleScale from "./multipleScale";
import MultipleRotate from "./multipleRotate";

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
      rectData: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      rectCenter: {
        x: 0,
        y: 0,
      },
    };
  },

  mounted() {
    this.rectData = this.caleRectData();
  },

  watch: {
    actors() {
      this.rectData = this.caleRectData();
    },
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
      const { x, y, width, height } = this.rectData;
      return {
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        transform: `rotate(${this.rotate}deg)`,
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
    dragRotate(e) {
      const editorAreaInfo = document
        .getElementById("editor-area")
        .getBoundingClientRect();

      const { x, y, width, height } = this.rectData;

      const initData = {
        startRotate: this.rotate, // 开始角度
        startX: e.clientX - editorAreaInfo.x, // 鼠标按下去坐标
        startY: e.clientY - editorAreaInfo.y,
        centerX: x + width / 2, // 旋转元素中心点的坐标
        centerY: y + height / 2,
      };

      const rotateHandler = new RotateHandler(initData);
      const multipleRotate = new MultipleRotate(
        this.actors,
        this.rectData,
        this.rotate
      );

      dragAction(e, {
        init: () => {
          this.isRotate = true;
        },

        move: (e) => {
          this.rotate = rotateHandler.rotateHandler({
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          });
          const data = multipleRotate.handleRotate(this.rotate);
          this.$emit("upload", data);
        },

        end: () => {
          this.isRotate = false;
        },
      });
    },

    dragScale(type, e) {
      const editorAreaInfo = document
        .getElementById("editor-area")
        .getBoundingClientRect();

      const multipleScale = new MultipleScale(
        this.rectData,
        type,
        this.actors,
        this.rotate
      );
      dragAction(e, {
        init: () => {},
        move: (e) => {
          const { list, data } = multipleScale.handlerScale({
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          });
          this.rectData = data;
          this.$emit("upload", list);
        },
        end: () => {},
      });
    },

    handlerClick() {
      console.log("handlerClick");
    },

    dragMove(e) {
      this.$emit("dragMove", e);
      document.addEventListener("mousemove", this.handleMousemove);
      document.addEventListener("mouseup", this.handleMouseup);
    },

    handleMousemove(e) {
      this.rectData.x += e.movementX;
      this.rectData.y += e.movementY;
    },

    handleMouseup() {
      document.removeEventListener("mousemove", this.handleMousemove);
      document.removeEventListener("mouseup", this.handleMouseup);
    },

    caleRectData() {
      const topList = [];
      const leftList = [];
      const rightList = [];
      const bottomList = [];
      this.actors.forEach((item) => {
        const { x, y, mask, rotate } = item;
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
        // 物理位置
        let rotatedTopLeft = calcRotatedPoint(topLeft, center, rotate);
        let rotatedRigthBottom = calcRotatedPoint(rightBottom, center, rotate);
        let rotateTopRight = calcRotatedPoint(topRight, center, rotate);
        let rotateLeftBottom = calcRotatedPoint(leftBottom, center, rotate);

        // 以多选框的中心的回正
        if (this.rotate !== 0) {
          rotatedTopLeft = calcRotatedPoint(
            rotatedTopLeft,
            this.rectCenter,
            -this.rotate
          );
          rotatedRigthBottom = calcRotatedPoint(
            rotatedRigthBottom,
            this.rectCenter,
            -this.rotate
          );
          rotateTopRight = calcRotatedPoint(
            rotateTopRight,
            this.rectCenter,
            -this.rotate
          );
          rotateLeftBottom = calcRotatedPoint(
            rotateLeftBottom,
            this.rectCenter,
            -this.rotate
          );
        }

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

      let topLeft = {
        x: Math.min(...leftList),
        y: Math.min(...topList),
      };

      let rightBottom = {
        x: Math.max(...rightList),
        y: Math.max(...bottomList),
      };

      const width = rightBottom.x - topLeft.x;
      const height = rightBottom.y - topLeft.y;

      // 改变中心点
      if (this.rotate !== 0) {
        // 这里是久的中心点，记录物理位置
        topLeft = calcRotatedPoint(topLeft, this.rectCenter, this.rotate);

        rightBottom = calcRotatedPoint(
          rightBottom,
          this.rectCenter,
          this.rotate
        );
      }

      // 中的中心点
      this.rectCenter = {
        x: (topLeft.x + rightBottom.x) / 2,
        y: (topLeft.y + rightBottom.y) / 2,
      };

      // 以新的中心点回正
      const newTopLeft = calcRotatedPoint(
        topLeft,
        this.rectCenter,
        -this.rotate
      );

      return {
        ...newTopLeft,
        width,
        height,
      };
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