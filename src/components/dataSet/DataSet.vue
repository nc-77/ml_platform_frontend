<template>
  <div class="node" :class="nodeClass">
    <img :src="logo"/>
    <span class="label">{{ name }}</span>
    <span class="status">
        <img :src="statusImg" v-if="statusImg"/>
      </span>
  </div>
</template>

<script>
import * as common from "../common";


export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
    };
  },
  methods: {},

  mounted() {
    const node = this.getNode();
    // 初始化数据绑定
    common.mapper(node.data, this.$data);
    // 节点数据变化监听，从而绑定数据
    node.on("change:data", ({current}) => common.mapper(current, this.$data));
    // 绑定run方法供父组件调用
    node.setData({
      status: "success",
      run: () => {
      },
    })
  },

  computed: {
    nodeClass: function () {
      let clazz = {};
      if (this.status) clazz[this.status] = true;
      return clazz;
    },
    statusImg: function () {
      if (!this.status) {
        return "";
      }
      return "./src/assets/" + this.status + ".png";
    },
  },
};
</script>

