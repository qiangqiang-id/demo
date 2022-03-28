<template>
  <div class="container">
    <div class="box">
      <span v-for="i in 10" :key="i">{{ i * 10 }}%</span>
    </div>

    <div class="line"></div>
  </div>
</template>


<script>
export default {
  data() {
    return {};
  },
};
</script>


<style>
.container {
  height: 100vh;
}

.line {
  position: absolute;
  top: 0;
  left: 400px;
  width: 0;
  height: 400px;
  border: 1px solid skyblue;
}
.box {
  position: absolute;
  top: 0;
  left: 800px;
  width: 400px;
  height: 200px;
  transform: scaleX(-1);
  transform-origin: 0% 0;
  display: flex;
  justify-content: space-between;
}
span {
  width: 40px;
  height: 200px;
  display: inline-block;
}
span:nth-child(odd) {
  background-color: red;
}

span:nth-child(even) {
  background-color: green;
}
</style>