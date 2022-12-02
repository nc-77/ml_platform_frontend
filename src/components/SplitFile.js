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
          r: 4,
          magnet: true,
          stroke: "#31d0c6",
          strokeWidth: 2,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
        text: {
          fontSize: 12,
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
          r: 4,
          magnet: true,
          stroke: "#31d0c6",
          strokeWidth: 2,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
        text: {
          fontSize: 12,
        },
      },
    },
  },
  items: [
    {
      group: "in",
      attrs: {
        text: {
          text: "输入",
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
          text: "输出",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  ],
};
// splitFile 组件
let SplitFile = {
  metaData: {
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
      logo: "../src/assets/logo.png",
    },
  },
  run: async (node) => {
    const data = node.getData();
    // 检查父节点是否完成

    console.log("splitfile is running");
    node.setData({
      status: "running",
    });
    // do job
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("success"), 1000);
    });
    let result = await promise;
    node.setData({
      status: result,
    });
  },
};

export default SplitFile;
