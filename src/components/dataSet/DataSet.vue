<template>
  <div>
    <a-dropdown :trigger="['contextmenu']" :disabled="!showContextMenu">
      <div class="node" :class="nodeClass">
        <img :src="logo"/>
        <span class="label">{{ name }}</span>
        <span class="status">
        <img :src="statusImg" v-if="statusImg"/>
      </span>
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="showTable" class="my-menu-item">查看数据结果
          </a-menu-item>
          <a-menu-item @click="" class="my-menu-item">数据分布可视化
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

    <a-modal v-model:visible="tableVisible" title="数据结果" :footer="null" width="100%"
             wrap-class-name="full-modal">
      <a-table :dataSource="dataSource" :columns="columns"/>
    </a-modal>
  </div>
</template>

<script>
import * as common from "../common";

export default {
  inject: ["getGraph", "getNode"],
  data() {
    return {
      showContextMenu: false,
      tableVisible: false,
      logo: "../src/assets/logo.png",
      label: "",
      name: "",
      status: "",
      columns: [],
      dataSource: [],
    };
  },
  methods: {
    getColumns() {
      const node = this.getNode();
      const graph = this.getGraph();
      const [file] = node.getData().files.values();
      common.getFileFieldList(file?.fileId).then(columnNames => {
        columnNames?.forEach(name => {
          this.columns.push({
            title: name,
            dataIndex: name,
            key: name,
          })
        })
      })
    },
    getDataSources() {
      const node = this.getNode();
      const graph = this.getGraph();
      const [file] = node.getData().files.values();
      fetch("http://localhost:8081/files/" + file?.fileId + "/content", {
        method: "GET"
      }).then(res => res.json()).then(res => this.dataSource = JSON.parse(res.data))
    },
    showTable() {
      if (this.columns.length === 0) {
        this.getColumns();
      }
      if (this.dataSource.length === 0) {
        this.getDataSources();
      }
      console.log(this.columns, this.dataSource);
      this.tableVisible = true;
    }
  },
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

<style>

</style>

