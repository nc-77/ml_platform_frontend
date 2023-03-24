// 工具类函数
import {notification} from "ant-design-vue";

const mapper = (source, target) => {
    for (let key in target) {
        target[key] = source?.[key] ?? target[key];
    }
};

const isEmpty = (val) => {
    return !(val !== undefined && val !== null && val !== '');
}


// JavaScript deep copy function
const deepCopy = (obj) => {
    if (typeof obj !== 'object') {
        return obj;
    }
    let newObj = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        newObj[key] = deepCopy(obj[key]);
    }
    return newObj;
}

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
const filterObjectsByProperty = (arr, p, val) => {
    return arr?.filter(obj => obj[p] === val);
}
// 当节点输入数据集只有一个时，获取其输入文件
const getInputFile = (node, graph) => {
    const incomingNode = getIncomingNodes(node, graph)?.at(0);
    const incomingPortId = getConnectedPort(node, graph, node.getPortAt(0));
    const files = incomingNode?.getData().files;
    return filterObjectsByProperty(files, "portId", incomingPortId)?.at(0);
}
// 获取节点指定port对应的输入文件
const getInputFileByPort = (node, graph, portIndex) => {
    const port = node.getPortAt(portIndex);
    let edges = graph.getConnectedEdges(node);
    let connectPortId = null;
    let incomingNode = null;
    edges?.forEach((edge) => {
        const sourcePortId = edge.getSourcePortId();
        const targetPortId = edge.getTargetPortId();
        if (sourcePortId === port.id) {
            connectPortId = targetPortId;
            incomingNode = edge.getTargetNode();
        }
        if (targetPortId === port.id) {
            connectPortId = sourcePortId;
            incomingNode = edge.getSourceNode();
        }
    })
    const files = incomingNode?.getData().files;
    return filterObjectsByProperty(files, "portId", connectPortId)?.at(0);
}
// 获取节点指定port对应的文件
const getFileByPort = (node, portIndex) => {
    const port = node.getPortAt(portIndex);
    const files = node?.getData().files;
    return filterObjectsByProperty(files, "portId", port.id)?.at(0);
}
// 获取文件列名
const getFileFieldList = (fileId) => {
    return fetch("http://localhost:8081/files/" + fileId + "/fieldList", {
        method: "GET"
    }).then(res => res.json()).then(res => res.data);
};
// 显示运行结果
const openNotificationWithIcon = (result) => {
    notification[result.type]({
        message: result.message,
        description: result.description,
    });
};


export {
    mapper,
    isEmpty,
    deepCopy,
    checkIncomingNodes,
    openNotificationWithIcon,
    getIncomingNodes,
    getConnectedPort,
    getInputFile,
    getInputFileByPort,
    getFileFieldList,
    getFileByPort
};
