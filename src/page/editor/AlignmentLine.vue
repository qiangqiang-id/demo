<template>
  <div
    class="alignment-line"
    :style="{ left: axis.x + 'px', top: axis.y + 'px' }"
  >
    <div :class="['line', type]" :style="sizeStyle"></div>
  </div>
</template>


<script>
export default {
  props: {
    type: {
      type: String, //  String as PropType<'vertical' | 'horizontal'>
      required: true,
    },
    axis: {
      type: Object, //  { x , y }
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
  },

  computed: {
    sizeStyle() {
      if (this.type === "vertical") {
        return { height: this.length + "px" };
      }
      return { width: this.length + "px" };
    },
  },
};
</script>

<style>
.alignment-line {
  position: absolute;
  z-index: 100;
}

.line {
  width: 0;
  height: 0;
  border: 0 dashed skyblue;
}

.horizontal {
  transform: translateX(-0.5px);
  border-top-width: 1px;
}

.vertical {
  transform: translateY(-0.5px);
  border-left-width: 1px;
}
</style>