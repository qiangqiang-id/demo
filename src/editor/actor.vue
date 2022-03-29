<template>
  <div :style="actorStyle"></div>
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
      let newPosition = {
        x: mask.x,
        y: mask.y,
      };

      // if (mask.anchor.y !== 0) {
      //   newPosition = {
      //     x: mask.x - mask.width * mask.anchor.x,
      //     y: mask.y - mask.height * mask.anchor.y,
      //   };
      // }

      // if (data.isReverse && mask.anchor.y === 0) {
      //   const x = mask.x - mask.width;

      //   newPosition = calcRotatedPoint(
      //     {
      //       x: x,
      //       y: mask.y,
      //     },
      //     {
      //       x: mask.x,
      //       y: mask.y,
      //     },
      //     data.rotate
      //   );
      // }

      return {
        width: data.width + "px",
        height: data.height + "px",
        position: "absolute",
        top: newPosition.y + "px",
        left: newPosition.x + "px",
        transform: `rotate(${data.rotate}deg) scaleX(${
          data.isReverse ? -1 : 1
        })`,
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