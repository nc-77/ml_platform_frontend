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
        groups: {
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
    },

};

export {ReadCsv};
