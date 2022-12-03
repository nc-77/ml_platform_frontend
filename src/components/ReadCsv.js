import { Graph } from "@antv/x6";

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
// ReadCsv 组件
let ReadCsv = {
  metaData: {
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
      logo: "../src/assets/logo.png",
    },
    attrs: {
      body: {
        height: 36,
      },
    },
  },
  run: async (node, graph) => {
    let result = {
      type: "",
      message: "",
      description: "",
    };
    // 检查父节点是否完成
    let edges = graph.getIncomingEdges(node);
    let incomingNodes = new Array();
    edges?.forEach((edge) => {
      incomingNodes.push(edge.getSourceCell());
    });
    let checkIncoming = true;
    incomingNodes?.forEach((node) => {
      let check = false;
      if (node.getData()?.status== "success") {
        check = true;
      }
      checkIncoming = checkIncoming && check;
    });
    if (!checkIncoming) {
      result = {
        type: "error",
        message: "节点运行失败！",
        description: "原因：上游节点未完成",
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
      message: "节点运行成功！",
    };
    return result;
  },
};

export default ReadCsv;
