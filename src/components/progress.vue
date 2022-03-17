<template>
  <div ref="el"></div>
</template>


<script>
import { Progress } from "@antv/g2plot";
export default {
  name: "Progress",

  data() {
    return {
      chart: null,
    };
  },

  mounted() {
    this.chart = new Progress(this.$refs.el, {
      autoFit: true,
      percent: 0.5,
      color: ["#44CE8B", "#E8EDF3"],
      barWidthRatio: 1,
    });

    this.chart.render();
  },
};
</script>
