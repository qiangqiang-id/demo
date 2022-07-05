<template>
  <div class="alignment-line" :style="{ left, top }">
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

  data() {
    return {
      left: 0,
      top: 0,
    };
  },

  computed: {
    sizeStyle() {
      return {};
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