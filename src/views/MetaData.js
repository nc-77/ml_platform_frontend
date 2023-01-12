// 定义组件元数据
import * as common from "@/components/common";

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

const ReadExcel = {
    shape: "img-node",
    width: 140,
    height: 36,
    x: 290,
    y: 110,
    ports: Port,
    data: {
        label: "读EXCEL文件",
        name: "读EXCEL文件",
        status: "",
        logo: "../src/assets/logo.png",
    },
};
const MergeFile = {
    shape: "img-node",
    width: 140,
    height: 36,
    x: 290,
    y: 110,
    ports: Port,
    data: {
        label: "合并",
        name: "合并",
        status: "",
        logo: "../src/assets/logo.png",
    },
};
const ReadCsv = {
    data: {
        label: "读CSV文件",
        name: "读CSV文件",
        status: "",
        formState: {
            selectedFile: File,
        }
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
                attrs: common.portAttrs,
            },
            // 输出链接桩群组定义
            out: {
                position: "bottom",
                label: {
                    position: "bottom", // 标签位置
                },
                attrs: common.portAttrs,
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

}
export {ReadCsv, ReadExcel, MergeFile, Port};
