// 工具类函数
const mapper = (source, target) => {
  for (let key in target) {
    target[key] = source?.[key] ?? target[key];
  }
};
// 定义连接桩样式
const portAttrs = {
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
};
// 检查上游节点状态
const checkIncomingNodes = (node, graph) => {
  let edges = graph.getIncomingEdges(node);
  let incomingNodes = new Array();
  edges?.forEach((edge) => {
    incomingNodes.push(edge.getSourceCell());
  });
  let checkIncoming = true;
  incomingNodes?.forEach((node) => {
    let check = false;
    if (node.getData()?.status == "success") {
      check = true;
    }
    checkIncoming = checkIncoming && check;
  });
  return checkIncoming;
};

// 提醒信息
const successMessage = (nodeName) => {
  return nodeName + " 节点运行成功！";
};
const failedMessage = (nodeName) => {
  return nodeName + " 节点运行失败！";
};
const checkIncomingFailedDesc = "原因：上游节点未完成";

export {
  mapper,
  checkIncomingNodes,
  portAttrs,
  successMessage,
  failedMessage,
  checkIncomingFailedDesc,
};
