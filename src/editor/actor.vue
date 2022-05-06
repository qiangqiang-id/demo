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

      return {
        width: data.width + "px",
        height: data.height + "px",
        position: "absolute",
        top: data.y + "px",
        left: data.x + "px",
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