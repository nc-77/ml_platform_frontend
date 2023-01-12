import * as common from "@/components/common";

// 提醒信息
const successMessage = (nodeName) => {
    return nodeName + " 节点运行成功！";
};
const failedMessage = (nodeName) => {
    return nodeName + " 节点运行失败！";
};
const checkIncomingFailedDesc = "原因：上游节点未完成";

const getStatus = (code) => {
    if ((code & 1) === 0) {
        return "success";
    }
    return "error";
}
const getResult = (response, nodeData) => {
    let result = {
        type: "", message: "", description: "",
    }
    const status = getStatus(response.code);
    result.type = status;
    if (status === "success") {
        result.message = successMessage(nodeData.name);
    } else if (status === "error") {
        result.message = failedMessage(nodeData.name);
        result.description = "原因：" + response.message;
    }
    return result;
}
export {
    successMessage,
    failedMessage,
    checkIncomingFailedDesc,
    getStatus,
    getResult
};