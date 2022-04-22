<template>
  <div :style="actorStyle">
    <!-- <img :src="data.url" /> -->
  </div>
</template>


<script>
// import { calcRotatedPoint } from "./drag";
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    actorStyle() {
      const data = this.data;
      const mask = data.mask;

      const rateX = (data.x + mask.x + mask.width / 2 - data.x) / data.width;
      const rateY = (data.y + mask.y + mask.height / 2 - data.y) / data.height;

      return {
        width: data.width + "px",
        height: data.height + "px",
        position: "absolute",
        top: data.y + "px",
        left: data.x + "px",
        transform: `rotate(${data.rotate}deg)`,
        transformOrigin: `${rateX * 100}% ${rateY * 100}%`,
      };
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