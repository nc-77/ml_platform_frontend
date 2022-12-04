import * as nodeTemplate from "./NodeTemplate";
import * as ret from "./Result";
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
// ReadCsv 组件
let ReadCsv = {
  metaData: {
    shape: "img-node",
    width: 140,
    height: 36,
    ports: port,
    data: {
      label: "读CSV文件",
      name: "读CSV文件",
      status: "",
      logo: "../src/assets/logo.png",
    },
  },

  run: async (node, graph) => {
    node.setData({
      status: "",
    });
    let result = {
      type: "",
      message: "",
      description: "",
    };
    let data = node.getData();
    // 检查上游节点是否完成
    if (!nodeTemplate.checkIncomingNodes(node, graph)) {
      result = {
        type: "error",
        message: ret.failedMessage(data.name),
        description: ret.checkIncomingFailedDesc,
      };
      return result;
    }

    console.log("readcsv is running");
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
      message: ret.successMessage(data.name),
    };
    return result;
  },
};

export default ReadCsv;
