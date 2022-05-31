<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script >
import dayjs from "dayjs";
export default {
  name: "App",
  data() {
    return {
      message: "Welcome to Your Vue.js App",
      text: "你好，我是大傻",
      num: 0,
      obj: {
        name: "大傻",
        age: 12,
      },
    };
  },

  methods: {
    handleClose({ id }) {
      const index = this.tagList.findIndex((item) => item.id === id);
      this.tagList.splice(index, 1);
      this.num++;
    },

    createTimeUnitListByTimeRange(startDate, endDate, timeUnit) {
      let startSeconds = new Date(startDate).getTime();
      let endSeconds = new Date(endDate).getTime();

      // 必须用计算机初始时间的时间戳来作为基准点，否则时区会影响初始时间戳毫秒数
      let base = new Date("1970-01-01 00:00:00").getTime();

      let rangeTimeUnitList = [];
      let firstDegree;

      // 第一个刻度，可能刚好在你需要的整点刻度上，如果不在整点上，减去多余的部分，往前推一个刻度。
      // 此处就是减掉基准时间戳再执行整除操作，否则如果以天为刻度，整除86400000，得到的第一个刻度会是包含时区的时间，如北京时间：2020-09-10 08：00：00
      firstDegree = startSeconds - ((startSeconds - base) % timeUnit);

      const data = dayjs(firstDegree).format("YYYY-MM-DD HH:mm");

      rangeTimeUnitList.push(data);

      // 当最后一个刻度大于截止时间，停止创建刻度数据
      while (firstDegree < endSeconds) {
        firstDegree += timeUnit;
        const data = dayjs(firstDegree).format("YYYY-MM-DD HH:mm");
        rangeTimeUnitList.push(data);
      }

      return rangeTimeUnitList;
    },

    // console.log(
    //   createTimeUnitListByTimeRange(
    //     '2021-09-01 12:00:00',
    //     '2021-09-01 13:00:00',
    //     600000
    //   ),
    //   '测试'
    // )

    handleClick() {
      console.log(
        this.createTimeUnitListByTimeRange(
          "2021-09-01 12:00:00",
          "2021-09-01 13:00:00",
          600000
        )
      );
    },
  },
};
</script>

<style>
html,
body,
#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}
</style>