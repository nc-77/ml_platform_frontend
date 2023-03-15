<template>
  <a-table
      :columns="this.columns"
      :row-key="record => record.id"
      :data-source="dataSource"
  >
    <template #bodyCell="{ column, record }">
    </template>
  </a-table>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: ["columnNames","dataSource"],
  computed: {
    columns() {
      return this.columnNames.forEach(name => {
        return {
          title: name,
          dataIndex: name,
        }
      })
    }
  }
};
</script>