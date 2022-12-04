const successMessage = (nodeName) => {
  return nodeName + " 节点运行成功！";
};
const failedMessage = (nodeName) => {
  return nodeName + " 节点运行失败！";
};
const checkIncomingFailedDesc = "原因：上游节点未完成";
export { successMessage, failedMessage, checkIncomingFailedDesc };
