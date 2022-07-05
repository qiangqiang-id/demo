<template>
  <div v-show="show">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "TabPane",
  inject: ["TabsInstance"],
  props: {
    name: {
      type: String,
    },
    label: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      show: true,
    };
  },
  mounted() {
    this.TabsInstance.initTabs();
  },

  watch: {
    label() {
      this.TabsInstance.initTabs();
    },

    name() {
      this.TabsInstance.initTabs();
    },
  },
};
</script>
