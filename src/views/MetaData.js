// 定义组件元数据
const Port = {
  groups: {
    // 输入链接桩群组定义
    in: {
      position: "top",
      label: {
        position: "top", // 标签位置
      },
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: "#31d0c6",
          strokeWidth: 2,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    // 输出链接桩群组定义
    out: {
      position: "bottom",
      label: {
        position: "bottom", // 标签位置
      },
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: "#31d0c6",
          strokeWidth: 2,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  },
  items: [
    {
      group: "in",
      attrs: {
        text: {
          text: "in1",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    {
      group: "out",
      attrs: {
        text: {
          text: "out1",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  ],
};

const ReadCSV = {
  shape: "img-node",
  width: 140,
  height: 36,
  x: 290,
  y: 110,
  ports: Port,
  data: {
    label: "读CSV文件",
    name: "读CSV文件",
    status: "",
    statusImg: "",
    logo: "../src/assets/logo.png",
  },
  attrs: {
    body: {
      height: 36,
    },
  },
};
const ReadExcel = {
  shape: "img-node",
  width: 140,
  height: 36,
  x: 290,
  y: 110,
  ports: Port,
  data: {
    label: "读EXCEL文件",
    name: "读EXCEL文件",
    status: "",
    statusImg: "",
    logo: "../src/assets/logo.png",
  },
};
const SpiltFile = {
  shape: "img-node",
  width: 140,
  height: 36,
  x: 290,
  y: 110,
  ports: Port,
  data: {
    label: "拆分",
    name: "拆分",
    status: "",
    statusImg: "",
    logo: "../src/assets/logo.png",
  },
};
const MergeFile = {
  shape: "img-node",
  width: 140,
  height: 36,
  x: 290,
  y: 110,
  ports: Port,
  data: {
    label: "合并",
    name: "合并",
    status: "",
    statusImg: "",
    logo: "../src/assets/logo.png",
  },
};
export { ReadCSV, ReadExcel, SpiltFile, MergeFile, Port };
