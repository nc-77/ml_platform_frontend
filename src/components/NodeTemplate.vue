<template>
  <div :class="nodeClass" class="node">
    <img :src="logo" />
    <span class="label">{{ name }}</span>
    <span class="status">
      <img :src="statusImg" v-if="statusImg" />
    </span>
  </div>
</template>

<script>
export default {
  name: "NodeTemplate",
  inject: ["getGraph", "getNode"],
  data() {
    return {
      label: "",
      name: "",
      status: "",
      logo: "",
    };
  },

  methods: {
    mapper(source, target) {
      for (let key in target) {
        target[key] = source?.[key] ?? target[key];
      }
    },
  },

  mounted() {
    let node = this.getNode();
    // 初始化数据绑定
    this.mapper(node.data, this.$data);
    // 节点数据变化监听，从而绑定数据
    node.on("change:data", ({ current }) => this.mapper(current, this.$data));
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
<style>
.node {
  display: flex;
  align-items: center;
  width: 100%;
  height: 36px;
  background-color: #fff;
  border: 1px solid #c2c8d5;
  border-left: 4px solid #5f95ff;
  border-radius: 4px;
  box-shadow: 0 2px 5px 1px rgba(0, 0, 0, 0.06);
}
.node img {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-left: 8px;
}
.node .label {
  display: inline-block;
  flex-shrink: 0;
  width: 104px;
  margin-left: 8px;
  color: #666;
  font-size: 12px;
}
.node .status {
  flex-shrink: 0;
}
.node.success {
  border-left: 4px solid #52c41a;
}
.node.failed {
  border-left: 4px solid #ff4d4f;
}
.node.running .status img {
  animation: spin 1s linear infinite;
}

.x6-node-selected .node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}
.x6-node-selected .node.success {
  border-color: #52c41a;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #ccecc0;
}
.x6-node-selected .node.failed {
  border-color: #ff4d4f;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #fedcdc;
}
.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
