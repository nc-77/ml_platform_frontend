import * as nodeTemplate from "./NodeTemplate";
// 定义组件元数据
const port = {
  groups: {
    // 输入链接桩群组定义
    in: {
      position: "top",
      label: {
        position: "top", // 标签位置
      },
      attrs: nodeTemplate.portAttrs,
    },
    // 输出链接桩群组定义
    out: {
      position: "bottom",
      label: {
        position: "bottom", // 标签位置
      },
      attrs: nodeTemplate.portAttrs,
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
    ports: port,
    data: {
      label: "拆分",
      name: "拆分",
      status: "",
      logo: "../src/assets/logo.png",
    },
  },
  run: async (node,graph) => {
    let result = {
      type: "",
      message: "",
      description: "",
    };
    // 检查上游节点是否完成
    if (!nodeTemplate.checkIncomingNodes(node, graph)) {
      result = {
        type: "error",
        message: "节点运行失败！",
        description: "原因：上游节点未完成",
      };
      return result;
    }

    console.log("splitFile is running");
    node.setData({
      status: "running",
    });
    // do job
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("success"), 1000);
    });
    let status = await promise;
    node.setData({
      status: status,
    });
    result = {
      type: "success",
      message: "节点运行成功！",
    };
    return result;
  },
};

export default SplitFile;
