// 工具类函数
import {notification} from "ant-design-vue";

const mapper = (source, target) => {
    for (let key in target) {
        target[key] = source?.[key] ?? target[key];
    }
};

// 检查上游节点状态
const checkIncomingNodes = (node, graph) => {
    const incomingNodes = getIncomingNodes(node, graph);
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
// 获取port连接的另一个port
const getConnectedPort = (node, graph, port) => {
    let edges = graph.getConnectedEdges(node);
    let connectPortId = null;
    edges?.forEach((edge) => {
        const sourcePortId = edge.getSourcePortId();
        const targetPortId = edge.getTargetPortId();
        if (sourcePortId === port.id) {
            connectPortId = targetPortId;
        }
        if (targetPortId === port.id) {
            connectPortId = sourcePortId;
        }
    })
    return connectPortId;
}
// 当节点输入数据集只有一个时，获取其输入文件
const getInputFile = (node, graph) => {
    const incomingNode = getIncomingNodes(node, graph)?.at(0);
    const incomingPortId = getConnectedPort(node, graph, node.getPortAt(0));
    return incomingNode?.getData().files?.get(incomingPortId);
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
    getConnectedPort,
    getInputFile
};
