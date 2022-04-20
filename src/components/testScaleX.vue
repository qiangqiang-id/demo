<template>
  <div class="container">
    <div class="father"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {
        x: 0,
        y: 0,
        width: 600,
        height: 400,
        mask: {
          x: 0,
          y: 0,
          width: 600,
          height: 400,
        },
        rotate: 45,
        anchtor: {
          x: 0,
          y: 0,
        },
      },
    };
  },
};
</script>

<style>
.container {
  height: 80vh;
  width: 80vh;
  border: 1px solid black;
  margin: 0 auto;
  position: relative;
}

.father {
  position: absolute;
  top: 200px;
  left: 100px;
  width: 600px;
  height: 400px;
  background: skyblue;
  transform: rotate(45deg);
}
</style>