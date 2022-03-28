<template>
  <div :style="actorStyle">
    <img v-if="data.url" :src="data.url" />
  </div>
</template>


<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    actorStyle() {
      return {
        width: this.data.width + "px",
        height: this.data.height + "px",
        position: "absolute",
        top: this.computedY + "px",
        left: this.computedX + "px",
        transform: `rotate(${this.data.rotate}deg) scaleX(${
          this.data.isReverse ? -1 : 1
        })`,
        transformOrigin: `${this.data.anchor.x * 100}% ${
          this.data.anchor.y * 100
        }%`,
      };
    },

    computedX() {
      let result;
      const data = this.data;
      if (data.anchor.y !== 0) {
        result = data.x - data.width * data.anchor.x;
        if (data.isReverse) {
          // result += data.mask.width;
        }
      } else {
        result = data.x;
      }
      return result;
    },

    computedY() {
      const data = this.data;
      if (data.anchor.y !== 0) {
        return data.y - data.height * data.anchor.y;
      }
      return data.y;
    },
  },
};
</script>


<style>
img {
  display: block;
  height: 100%;
  width: 100%;
  -webkit-user-drag: none;
}
</style>