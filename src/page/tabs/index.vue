<template>
  <div>
    <Tabs v-model="curTab">
      <TabPane name="list1" label="列表1">列表1</TabPane>
      <TabPane name="list2" label="列表2">列表2</TabPane>
      <TabPane name="list3" label="列表3">列表3</TabPane>
      <TabPane name="list4" label="列表4">列表4</TabPane>
      <TabPane name="list5" label="列表5">列表5</TabPane>
      <TabPane name="list6" label="列表6">列表6</TabPane>
      <TabPane name="list7" label="列表7">列表7</TabPane>
    </Tabs>
  </div>
</template>


<script>
import Tabs from "./tabs.vue";
import TabPane from "./tab-pane.vue";
export default {
  data() {
    return {
      curTab: "",
    };
  },

  components: {
    Tabs,
    TabPane,
  },
};
</script>