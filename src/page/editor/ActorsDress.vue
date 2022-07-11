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
        <img src="@/assets/icon_rotate.png" alt="rotateIcon" />
      </div>
    </div>
  </div>
</template>


<script>
import { POINT_LIST, POSITION, INIT_ANGLE, ANGLE_CURSOR } from "./constants";
import { RotateHandler, MultipleScale, MultipleRotate } from "./Operate";
import {
  calcRotatedPoint,
  dragAction,
  getRectRotatedRange,
} from "./Operate/helper";

export default {
  props: {
    actors: {
      type: Array,
      default: () => [],
    },
    selectedIds: {
      type: Array,
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
    this.updateRectData();
  },

  watch: {
    actors() {
      this.updateRectData();
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
    updateRectData() {
      this.rectData = this.caleRectData();
    },

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
        this.rotate,
        this.selectedIds
      );
      dragAction(e, {
        move: (e) => {
          const { list, data, alignmentLines } = multipleScale.handlerScale({
            x: e.clientX - editorAreaInfo.x,
            y: e.clientY - editorAreaInfo.y,
          });

          this.rectData = data;
          this.$emit("upload", list, alignmentLines);
        },
        end: () => {
          this.$emit("clearAlignmentLines");
        },
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
      const xAixsList = [];
      const yAixsList = [];
      this.actors.forEach((item) => {
        const { x, y, mask, rotate } = item;

        const { xRange, yRange } = getRectRotatedRange({
          rotate,
          x: x + mask.x,
          y: y + mask.y,
          width: mask.width,
          height: mask.height,
        });

        let xAixs = xRange;
        let yAixs = yRange;
        if (this.rotate !== 0) {
          const center = {
            x: x + mask.x + mask.width / 2,
            y: y + mask.y + mask.height / 2,
          };

          const newCenter = calcRotatedPoint(
            center,
            this.rectCenter,
            -this.rotate
          );
          const { xRange, yRange } = getRectRotatedRange({
            x: newCenter.x - mask.width / 2,
            y: newCenter.y - mask.height / 2,
            width: mask.width,
            height: mask.height,
            rotate: rotate - this.rotate,
          });
          xAixs = xRange;
          yAixs = yRange;
        }
        xAixsList.push(...xAixs);
        yAixsList.push(...yAixs);
      });

      let topLeft = {
        x: Math.min(...xAixsList),
        y: Math.min(...yAixsList),
      };

      let rightBottom = {
        x: Math.max(...xAixsList),
        y: Math.max(...yAixsList),
      };

      const width = rightBottom.x - topLeft.x;
      const height = rightBottom.y - topLeft.y;

      // 假设已选中两个元素，并且带旋转，增加第三个
      // 首先将三个元素全部以，选中两个编辑的中心点反向旋转。
      // 得到未旋转的状态的位置信息。
      // 计算出矩形
      // 改变中心点
      if (this.rotate !== 0) {
        // 这里是旧的中心点，记录物理位置
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