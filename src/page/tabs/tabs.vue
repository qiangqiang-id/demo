<template>
  <div class="tabs">
    <div
      ref="navWrap"
      class="tabs-nav-wrap"
      :class="[scrollable ? 'tabs-nav-scrollable' : '']"
    >
      <!-- 左右切换箭头 -->
      <!-- <span
        class="tabs-nav-prev"
        :class="[scrollable ? '' : 'tabs-nav-scroll-disabled']"
        @click="scrollPrev"
        >&lt;</span
      > -->


      <span
        :class="[ isWrap ? 'tabs-nav-open': 'tabs-nav-close']"
        @click="toggle"
        >&gt;</span
      >
        <!-- @click="scrollNext" -->
        <!-- scrollable ? '' : 'tabs-nav-scroll-disabled', -->


      <div ref="navScroll" class="tabs-nav-scroll">
        <div ref="nav" class="tabs-nav" :style="navStyle" :class="[isWrap ? 'cate-tags--expand' : '']">
          <!-- :class="isWrap ? 'nav-wrap' : ''" -->
          <div class="tabs-inv-bar" :style="barStyle"></div>
          <div
            class="tabs-tab"
            v-for="(item, index) in navList"
            :key="index"
            @click="handleChange(index)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="pane-content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
// import elementResizeDetectorMaker from "element-resize-detector";
export default {
  name: "Tabs",
  provide() {
    return { TabsInstance: this };
  },
  props: {
    value: {
      type: [String, Number],
    },
  },
  data() {
    return {
      navList: [],
      activeKey: this.value,
      barWidth: 0,
      barOffset: 0,
      scrollable: false,
      navStyle: {
        transform: "",
      },

      isWrap: false,

    };
  },
  computed: {
    barStyle() {
      return {
        width: `${this.barWidth}px`,
        transform: `translate3d(${this.barOffset}px,0px,0px)`,
      };
    },
  },
  methods: {
    toggle(){
      this.isWrap = !this.isWrap
    },


    getTabs() {
      return this.$children.filter((item) => item.$options.name === "TabPane");
    },

    initTabs() {
      this.updateNav();
      this.updateStatus();
      this.updataBar();
    },

    updateNav() {
      this.navList = [];
      this.getTabs().forEach((pane, index) => {
        this.navList.push({
          label: pane.label,
          name: pane.name || index,
        });
        if (index === 0 && !this.activeKey) {
          this.activeKey = pane.name;
        }
      });
    },

    updataBar() {
      this.$nextTick(() => {
        const index = this.navList.findIndex(
          (nav) => nav.name === this.activeKey
        );
        const elemTabs = this.$refs.navWrap.querySelectorAll(".tabs-tab");
        const elemTab = elemTabs[index];
        this.barWidth = elemTab ? elemTab.offsetWidth : 0;
        if (index > 0) {
          let offset = 0;
          for (let i = 0; i < index; i++) {
            offset += elemTabs[i].offsetWidth + 16;
          }
          this.barOffset = offset;
        } else {
          this.barOffset = 0;
        }
      });
    },

    updateStatus() {
      const tabs = this.getTabs();
      tabs.forEach((tab) => (tab.show = tab.name === this.activeKey));
    },

    handleChange(index) {
      const nav = this.navList[index];
      this.activeKey = nav.name;
    },

    handleResize() {
      const navWidth = this.$refs.nav.offsetWidth;
      const scrollWidth = this.$refs.navScroll.offsetWidth;
      if (scrollWidth < navWidth) {
        this.scrollable = true;
      } else {
        this.scrollable = false;
      }
      this.updateMove();
    },

    updateMove() {
      const navWidth = this.$refs.nav.offsetWidth;
      const scrollWidth = this.$refs.navScroll.offsetWidth;
      const currentOffset = this.getCurrentScrollOffset();
      if (scrollWidth < navWidth) {
        if (navWidth - currentOffset < scrollWidth) {
          this.navStyle.transform = `translateX(-${navWidth - scrollWidth}px)`;
        }
      } else {
        if (currentOffset > 0) {
          this.navStyle.transform = `translateX(-${0}px)`;
        }
      }
    },

    getCurrentScrollOffset() {
      const { navStyle } = this;
      const reg = /translateX\(-(\d+(\.\d+)*)px\)/;
      return navStyle.transform ? Number(navStyle.transform.match(reg)[1]) : 0;
    },

    setOffset(value) {
      this.navStyle.transform = `translateX(-${value}px)`;
    },

    scrollPrev() {
      const containerWidth = this.$refs.navScroll.offsetWidth;
      const currentOffset = this.getCurrentScrollOffset();
      if (!currentOffset) return;
      let newOffset = 0;
      if (currentOffset > containerWidth) {
        newOffset = currentOffset - containerWidth;
      }
      this.navStyle.transform = `translateX(-${newOffset}px)`;
    },

    scrollNext() {
      // this.isWrap = !this.isWrap;
      const navWidth = this.$refs.nav.offsetWidth;
      const containerWidth = this.$refs.navScroll.offsetWidth;
      const currentOffset = this.getCurrentScrollOffset();
      if (navWidth - currentOffset <= containerWidth) return;
      let newOffset = null;
      if (navWidth - currentOffset > containerWidth * 2) {
        newOffset = currentOffset + containerWidth;
      } else {
        newOffset = navWidth - containerWidth;
      }
      this.navStyle.transform = `translateX(-${newOffset}px)`;
    },
  },
  watch: {
    value(val) {
      this.activeKey = val;
    },

    activeKey() {
      this.updateStatus();
      this.updataBar();
    },
  },

  mounted() {
    // this.observer = elementResizeDetectorMaker();
    // this.observer.listenTo(this.$refs.navWrap, this.handleResize);
  },

  beforeDestroy() {
    // this.observer.removeListener(this.$refs.navWrap, this.handleResize);
  },
};
</script>
<style scoped>
.tabs-nav-wrap {
  /* position: relative; */
  border-bottom: 1px solid #dcdee2;
  margin-bottom: 16px;
}

.tabs-tab {
  position: relative;
  display: inline-block;
  margin-right: 16px;
  padding: 8px 16px;
  cursor: pointer;
}

.tabs-inv-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: #2d8cf0;
  height: 2px;
  transition: transform 300ms ease-in-out;
}

.tabs-nav-scroll {
  overflow: hidden;
  white-space: nowrap;
}

.tabs-nav {
  position: relative;
  float: left;
  /* transition: transform 0.5s ease-in-out;  */
}

.nav-wrap {
  white-space: normal;
}

.tabs-nav-prev,
.tabs-nav-next {
  position: absolute;
  width: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
}

.tabs-nav-prev {
  left: 0;
}

.tabs-nav-next {
  right: 0;
}



.tabs-nav-scrollable {
  padding: 0 32px;
}

.tabs-nav-scroll-disabled {
  display: none;
}
</style>


<style scoped>

.tabs-nav-wrap{
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
}

.tabs-nav-close,.tabs-nav-open{
  display: block;
  height: 40px;
  width: 40px;
  line-height: 40px;
  text-align: center;
  position: absolute;
  text-align: center;
  cursor: pointer;
  right: 0;
  z-index: 1;
}

.tabs-nav-close{
  transform: rotate(-90deg);
}

.tabs-nav-open{
   transform: rotate(90deg);
}

.cate-tags--expand{
  white-space: normal;
}

.pane-content{
  margin-top: 40px;
}
</style>
