<template>
  <div class="clip-container">
    <div class="clip-area">
      <div ref="rectRef" class="rect" :style="rectStyle">
        <img class="img" :src="data.url" />
      </div>

      <div
        class="mask"
        ref="maskRef"
        @mousedown="handleMove"
        :style="maskStyle"
      >
        <!-- 九宫格 -->
        <div
          class="vertical-line"
          v-for="num in 2"
          :key="num + 'vertical'"
          :style="{ left: (maskData.width / 3) * num + 'px' }"
        ></div>
        <div
          class="horizontal-line"
          v-for="num in 2"
          :key="num + 'horizontal'"
          :style="{ top: (maskData.height / 3) * num + 'px' }"
        ></div>
      </div>
    </div>

    <ClipDress :data="data" :maskData="maskData" @update="updateHandler" />
  </div>
</template>

<script>
import ClipDress from "./ClipDress.vue";
import { dragAction, calcRotatedPoint } from "./drag";
import { MaskMove } from "./manualCilping";
export default {
  components: {
    ClipDress,
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
      maskData: {
        // x: 0,
        // y: 0,
        // width: 0,
        // height: 0,
        // rotate: 0,
      },
    };
  },

  created() {
    this.initActorData();
  },

  mounted() {
    document.addEventListener("mousedown", this.handleClickDocment);
  },

  beforeDestroy() {
    document.removeEventListener("mousedown", this.handleClickDocment);
  },

  computed: {
    rectStyle() {
      const { x, y, width, height, rotate, scale, anchor } = this.data;
      return {
        position: "absolute",
        left: x + "px",
        top: y + "px",
        width: width + "px",
        height: height + "px",
        transform: `rotate(${rotate}deg) scale(${scale.x},${scale.y})`,
        overflow: "hidden",
        transformOrigin: `${anchor.x * 100}% ${anchor.y * 100}%`,
      };
    },

    maskStyle() {
      const { x, y, width, height, rotate } = this.maskData;
      return {
        position: "absolute",
        top: y + "px",
        left: x + "px",
        width: width + "px",
        height: height + "px",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "rgba(255,255,255,.4) 0px 0px 0px 2005px",
      };
    },
  },

  methods: {
    initActorData() {
      const { x, y, mask, rotate } = this.data;

      this.maskData = {
        x: x + mask.x,
        y: y + mask.y,
        width: mask.width,
        height: mask.height,
        rotate,
        anchor: { x: 0.5, y: 0.5 },
      };
    },

    handleClickDocment(e) {
      const rectDom = this.$refs.rectRef;
      const maskDom = this.$refs.maskRef;
      if (!rectDom.contains(e.target) && !maskDom.contains(e.target)) {
        const rotatedPoint = this.calRotatedRectPoint();
        const { x, y, width, height } = this.maskData;
        const maskCenter = {
          x: x + width / 2,
          y: y + height / 2,
        };
        const newPoint = calcRotatedPoint(
          rotatedPoint,
          maskCenter,
          -this.data.rotate
        );

        const anchor = {
          x: (x - newPoint.x + width / 2) / this.data.width,
          y: (y - newPoint.y + height / 2) / this.data.height,
        };

        this.$emit(
          "update",
          { ...newPoint, anchor },
          {
            x: x - newPoint.x,
            y: y - newPoint.y,
            width,
            height,
          }
        );

        this.$emit("closeClip");
      }
    },

    calRotatedRectPoint() {
      const { x, y, width, height, anchor, rotate } = this.data;
      const center = {
        x: x + width * anchor.x,
        y: y + height * anchor.y,
      };

      return calcRotatedPoint({ x, y }, center, rotate);
    },

    handleMove(e) {
      const maskMove = new MaskMove(this.data, this.maskData, e);
      dragAction(e, {
        init: () => {},
        move: (e) => {
          const data = maskMove.handlerMove(e);
          Object.assign(this.maskData, data);
        },
        end: () => {},
      });
    },

    updateHandler(data) {
      Object.assign(this.maskData, data);
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

/* .point-container {
  pointer-events: none;
} */
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