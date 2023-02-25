// 工具类函数
import {notification} from "ant-design-vue";

const mapper = (source, target) => {
    for (let key in target) {
        target[key] = source?.[key] ?? target[key];
    }
};

// 检查上游节点状态
const checkIncomingNodes = (node, graph) => {
    const incomingNodes = getIncomingNodes(node,graph);
    let checkIncoming = true;
    incomingNodes?.forEach((node) => {
        let check = false;
        if (node.getData()?.status === "success") {
            check = true;
        }
        checkIncoming = checkIncoming && check;
    });
    return checkIncoming;
};
// 获取上游节点
const getIncomingNodes = (node, graph) => {
    let edges = graph.getIncomingEdges(node);
    let incomingNodes = [];
    edges?.forEach((edge) => {
        incomingNodes.push(edge.getSourceCell());
    });
    return incomingNodes;
}
// 显示运行结果
const openNotificationWithIcon = (result) => {
    notification[result.type]({
        message: result.message,
        description: result.description,
    });
};


export {
    mapper,
    checkIncomingNodes,
    openNotificationWithIcon,
    getIncomingNodes,
};
