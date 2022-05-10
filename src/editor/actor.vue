<template>
  <div :style="actorStyle">
    <!-- <img :src="data.url" /> -->
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
      const data = this.data;
      const mask = data.mask;

      return {
        width: mask.width + "px",
        height: mask.height + "px",
        position: "absolute",
        top: data.y + mask.y + "px",
        left: data.x + mask.x + "px",
        transform: `rotate(${data.rotate}deg) scale(${data.scale.x}, ${data.scale.y})`,
        transformOrigin: `${data.anchor.x * 100}% ${data.anchor.y * 100}%`,
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