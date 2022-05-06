<template>
  <div class="clip-container">
    <div class="clip-area">
      <div ref="rectRef" class="rect" :style="rectStyle">
        <img class="img" :src="data.url" />
        <div class="mask" @mousedown="handleMove" :style="maskStyle">
          <!-- 九宫格 -->
          <div
            class="vertical-line"
            v-for="num in 2"
            :key="num + 'vertical'"
            :style="{ left: (data.mask.width / 3) * num + 'px' }"
          ></div>
          <div
            class="horizontal-line"
            v-for="num in 2"
            :key="num + 'horizontal'"
            :style="{ top: (data.mask.height / 3) * num + 'px' }"
          ></div>
        </div>
      </div>
    </div>

    <ActorDress :data="data" @update="updateHandler" :isAutoClip="false" />
  </div>
</template>

<script>
import ActorDress from "./ActorDress.vue";
import { calcRotatedPoint } from "./drag";
export default {
  components: {
    ActorDress,
  },
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      pointList: [],
    };
  },

  mounted() {
    document.addEventListener("mousedown", this.handleClickDocment);
  },

  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickDocment);
  },

  computed: {
    rectStyle() {
      const { x, y, width, height, anchor, rotate, scale } = this.data;
      return {
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        transform: `rotate(${rotate}deg) scale(${scale.x},${scale.y})`,
        transformOrigin: `${anchor.x * 100}% ${anchor.y * 100}%`,
        overflow: "hidden",
      };
    },

    maskStyle() {
      const { x, y, width, height } = this.data.mask;
      return {
        position: "absolute",
        top: y + "px",
        left: x + "px",
        width: width + "px",
        height: height + "px",
        boxShadow: "rgba(255,255,255,.4) 0px 0px 0px 2005px",
      };
    },
  },

  methods: {
    handleClickDocment(e) {
      const rectDom = this.$refs.rectRef;
      if (!rectDom.contains(e.target)) {
        this.$emit("closeClip");
      }
    },

    handleMove() {
      const { mask } = this.data;
      // const startRectData = { x, y, width, height };
      // const startMaskData = { ...mask };
      const handleMousemove = (e) => {
        this.updateHandler(
          {},
          { x: mask.x + e.movementX, y: mask.y + e.movementY }
        );
      };

      const handleMouseup = () => {
        document.removeEventListener("mousemove", handleMousemove);
        document.removeEventListener("mouseup", handleMouseup);
      };

      document.addEventListener("mousemove", handleMousemove);
      document.addEventListener("mouseup", handleMouseup);
    },

    updateHandler(newValue, maskValue) {
      this.$emit("update", newValue, maskValue);
    },

    // 根据开始位置，旋转后的左上角的位置
    toRectforRotate() {
      const { x, y, mask, rotate } = this.data;
      const startCenterPoint = {
        x: x + mask.x + mask.width / 2,
        y: y + mask.y + mask.height / 2,
      };
      // 根据开始位置，旋转后的左上角的位置
      return calcRotatedPoint({ x, y }, startCenterPoint, rotate);
    },

    //2： 中心点发生变化重新计算rect 的位置 , 保证统一旋转点
    resetToRectPosition(maskData, rectPosition) {
      const currentCenterPoint = {
        x: maskData.x + maskData.width / 2,
        y: maskData.y + maskData.height / 2,
      };
      // 根据改变的中心点，计算出旋转的位置
      return calcRotatedPoint(
        { x: rectPosition.x, y: rectPosition.y },
        currentCenterPoint,
        -this.data.rotate
      );
    },
  },
};
</script>


<style>
.clip-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  background-color: rgba(53, 71, 90, 0.2);
}

.clip-area {
  width: 800px;
  height: 800px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.img {
  user-select: none;
  width: 100%;
  height: 100%;
}

.vertical-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6);
}

.horizontal-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.6);
}

.rect,
.mask {
  outline: 2px solid skyblue;
}

.point-container {
  pointer-events: none;
}
.rect-point,
.mask-point {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background-color: #fff;
  border: 2px solid #eee;
  pointer-events: auto;
}
</style>