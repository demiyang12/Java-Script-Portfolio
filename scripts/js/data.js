// 故事节点数据
const storyData = [
    {
        step: 0,
        title: "The Ancient Tea-Horse Road",
        subtitle: "A Journey Through Time in Yunnan",
        type: "intro",
        center: [25.0452, 102.7097], // 云南中心坐标
        zoom: 7
    },
    {
        step: 1,
        title: "Xishuangbanna: The Tea Origin",
        content: "Our journey begins in the tropical rainforests of Xishuangbanna, where ancient tea trees have thrived for centuries. This is the birthplace of Pu'er tea, the precious commodity that would travel thousands of miles along the Tea-Horse Road.",
        coordinates: [21.9588, 100.2191],
        zoom: 9,
        media: {
            images: ["images/photos/puer-tea.jpg"],
            facts: [
                "Some tea trees here are over 800 years old!",
                "The Dai people have been cultivating tea here for millennia"
            ]
        },
        markers: [
            {
                lat: 21.9588,
                lng: 100.2191,
                title: "Ancient Tea Forests",
                description: "Home to 800-year-old tea trees",
                type: "tea"
            }
        ]
    },
    {
        step: 2,
        title: "Dali: The Ancient Kingdom",
        content: "Nestled between the Cangshan Mountains and Erhai Lake, Dali served as a crucial trading post. The Bai people built their distinctive architecture here, creating a kingdom that controlled trade routes for centuries.",
        coordinates: [25.6065, 100.2676],
        zoom: 11,
        media: {
            images: ["images/photos/dali-old-town.jpg"],
            facts: [
                "Dali was the capital of the Nanzhao and Dali kingdoms",
                "The Three Pagodas are over 1,000 years old"
            ]
        }
    },
    // 更多节点数据...
];

// 茶马古道路线坐标
const teaHorseRoute = [
    [21.9588, 100.2191], // 西双版纳
    [25.6065, 100.2676], // 大理
    [26.8550, 100.2278], // 丽江
    [27.8251, 99.7070],  // 香格里拉
    [29.6563, 91.1153]   // 拉萨（延伸）
];