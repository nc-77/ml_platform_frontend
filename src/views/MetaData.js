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
// 定义连接桩群组
const portGroups = {
    // 输入链接桩群组定义
    in: {
        position: "top",
        label: {
            position: "top", // 标签位置
        },
        attrs: portAttrs,
    },
    // 输出链接桩群组定义
    out: {
        position: "bottom",
        label: {
            position: "bottom", // 标签位置
        },
        attrs: portAttrs,
    },
};
// 定义数据源组件元数据
const DataSet = {
    data: {
        label: "预置数据集",
        name: "",
        status: "",
    },
    shape: "data-set",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
        items: [
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
    },
};
// 定义ReadCsv组件元数据
const ReadCsv = {
    data: {
        label: "读CSV文件",
        name: "读CSV文件",
        status: "",
    },
    shape: "read-csv-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
        items: [
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
    },

};
// 定义数据去重组件
const Distinct = {
    data: {
        label: "数据去重",
        name: "数据去重",
        status: "",
    },
    shape: "distinct-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
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
    },
}
// 定义提取标签列组件
const GetLabel = {
    data: {
        label: "提取标签列",
        name: "提取标签列",
        status: "",
    },
    shape: "get-label-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
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
    },
}
// 定义数据划分组件
const Split = {
    data: {
        label: "数据划分",
        name: "数据划分",
        status: "",
    },
    shape: "split-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
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
                        text: "输出表1",
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
                        text: "输出表2",
                        style: {
                            visibility: "hidden",
                        },
                    },
                },
            },
        ],
    },
}
// 定义线性回归组件
const Liner = {
    data: {
        label: "线性回归",
        name: "线性回归",
        status: "",
    },
    shape: "liner-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
        items: [
            {
                group: "in",
                attrs: {
                    text: {
                        text: "训练集输入",
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
                        text: "模型输出",
                        style: {
                            visibility: "hidden",
                        },
                    },
                },
            },
        ],
    },
}
// 定义预测组件
const Predict = {
    data: {
        label: "预测",
        name: "预测",
        status: "",
    },
    shape: "predict-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
        items: [
            {
                group: "in",
                attrs: {
                    text: {
                        text: "模型输入",
                        style: {
                            visibility: "hidden",
                        },
                    },
                },
            },
            {
                group: "in",
                attrs: {
                    text: {
                        text: "预测集输入",
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
    },
}
// 定义回归模型评估组件
const EvalLinear = {
    data: {
        label: "回归模型评估",
        name: "回归模型评估",
        status: "",
    },
    shape: "evalLinear-node",
    width: 140,
    height: 36,
    ports: {
        groups: portGroups,
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
    },
}
export {ReadCsv,DataSet,Distinct,GetLabel,Split,Liner,Predict,EvalLinear};