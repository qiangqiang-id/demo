<template>
  <div class="container" v-infinite-scroll="load">
    <div class="item" v-for="num in number" :key="num">{{ num }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      number: 7,
    };
  },

  methods: {
    load() {
      console.log("cahufa");
      this.number += 5;
    },
  },
};
</script>


<style scoped>
.container {
  overflow: auto;
  height: 100vh;
  width: 400px;
  background-color: green;
}

.item {
  margin-top: 10px;
  height: 100px;
  background-color: red;
}
</style>