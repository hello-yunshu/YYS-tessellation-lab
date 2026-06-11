// AI 说明内容配置

export type AIExplanation = {
  id: string;
  title: string;
  implementationTime: string;
  teachingPurpose: string;
  aiContribution: string;
  promptExample: string;
  technicalIdea: string;
  iterationIdeas: string[];
};

export const aiExplanations: AIExplanation[] = [
  {
    id: "life-examples",
    title: "生活导入模块",
    implementationTime: "约5分钟（SVG图案+揭示按钮）",
    teachingPurpose:
      "用地砖、蜂巢、马赛克等生活图案，把学生已有经验和数学概念连接起来，帮助学生从生活现象中抽象出密铺的共同特征。",
    aiContribution:
      "教师可以用自然语言告诉 AI：我想要几个不用外部图片、可以直接投影的生活密铺图案。AI 可以自动生成 SVG 图案、引导问题和揭示性文字。",
    promptExample:
      "请为五年级《奇妙的图形密铺》设计一个生活导入区，用 SVG 画出地砖、蜂巢、马赛克墙面，并在点击按钮后显示它们的共同特点：无空隙、不重叠。",
    technicalIdea:
      "使用 React 组件封装生活图案，用 SVG polygon 或 rect 绘制图形，通过状态控制是否显示数学提示。",
    iterationIdeas: [
      "加入更多生活场景，如窗花、瓷砖、织物纹样。",
      "让学生点击图片后自己标记空隙和重叠。",
      "加入本地图片上传功能，让教师上传校园中的密铺照片。",
    ],
  },
  {
    id: "definition-compare",
    title: "密铺定义对比模块",
    implementationTime: "约8分钟（三种SVG对比图+判断逻辑）",
    teachingPurpose:
      "让学生通过对比正确密铺、有空隙、有重叠三种情况，真正理解密铺的两个核心条件：无空隙、不重叠。",
    aiContribution:
      "教师可以描述：请做三种对比图——正确的密铺，有空隙的排列，有重叠的排列。AI 可以生成 SVG 对比图和判断表格。",
    promptExample:
      "请制作三种情况对比图：无空隙不重叠的密铺、图形间有空隙、图形间有重叠。每种情况旁边标注'是否无空隙''是否不重叠''是否为密铺'。",
    technicalIdea:
      "在 SVG 内绘制三组图形：一组紧密排列（多边形顶点恰好相接），一组故意留出间距，一组让图形边界交叉。用简单的 React state 控制判断结果的显示。",
    iterationIdeas: [
      "让学生拖动图形来产生空隙或重叠。",
      "增加更多对比维度，如'能否继续延展'。",
      "加入动画，展示错误排列如何调整为正确密铺。",
    ],
  },
  {
    id: "tiling-lab",
    title: "图形密铺实验室",
    implementationTime: "约15分钟（9种图形生成算法+SVG渲染）",
    teachingPurpose:
      "让学生通过点击不同图形、观察它们的密铺效果，自己发现哪些图形能密铺、哪些不能，从而理解密铺的条件。",
    aiContribution:
      "教师可以说：我需要一个图形密铺实验室，点击不同图形按钮就能看到自动生成的密铺图案。AI 可以编写图形生成算法，用数学公式计算每种图形的密铺排列方式。",
    promptExample:
      "请做一个图形密铺实验室，包含正三角形、正方形、长方形、平行四边形、梯形、正六边形、正五边形、正八边形、正八边形+正方形组合。点击后在画布上自动生成密铺图案。",
    technicalIdea:
      "每种图形的密铺生成器用独立的函数实现，根据图形几何特性计算平移向量和旋转角度。正多边形用 regularPolygonPoints 生成顶点，用 translatePoints 排列。SVG polygon 渲染每个 tile，切换图形时有 drop 波浪动画。",
    iterationIdeas: [
      "支持自定义图形（用户输入边长和角度）。",
      "支持颜色主题切换。",
      "加入声音反馈（密铺成功提示音）。",
    ],
  },
  {
    id: "angle-explorer",
    title: "角度观察器",
    implementationTime: "约8分钟（扇形SVG+角度计算逻辑）",
    teachingPurpose:
      "用角度解释密铺的数学原理：判断一个正多边形能否单独密铺，关键是看它的内角能否整除 360°。通过'围在一点周围'的视觉演示让学生直观理解。",
    aiContribution:
      "教师可以描述：正三角形一个角是 60°，6 个围在一起正好 360°；正方形 90°，4 个围满；正五边形 108°，3 个不够 4 个多了。AI 可以生成扇形演示。",
    promptExample:
      "请设计一个角度观察器：选择正多边形后，显示围绕一个点的角度演示。点击'增加一个角'按钮，围绕中心逐个出现扇形。当正好拼成 360° 时显示'刚好铺满一周'。",
    technicalIdea:
      "用 SVG path 画扇形（arc 指令），围绕中心点旋转排列。用 React state 跟踪已添加的角度总和，实时判断是否达到、超过或不足 360°。支持增加/减少/重置操作。",
    iterationIdeas: [
      "支持任意角度输入（不只是正多边形）。",
      "展示多种组合方式（如正八边形+正方形）。",
      "加入动画过渡，扇形逐个出现。",
    ],
  },
  {
    id: "drag-playground",
    title: "拖拽拼摆区",
    implementationTime: "约15分钟（拖拽交互+旋转变换+SAT碰撞检测+网格吸附）",
    teachingPurpose:
      "给学生一个自由探索的空间，让他们自己拖动图形尝试拼摆，通过实际操作体验密铺的含义和条件。",
    aiContribution:
      "教师可以说：我想要一个拖拽拼摆区，学生可以从工具箱拖出图形到画布上，还能旋转图形，图形重叠时有提示，还能吸附到网格。AI 可以实现拖拽、旋转、碰撞检测和吸附功能。",
    promptExample:
      "请实现一个拖拽拼摆区：左侧工具箱有各种图形可点击添加到右侧画布，图形可以旋转 15°、30°、45°、60°、90°，可以删除图形，可以一键清空，支持网格吸附。",
    technicalIdea:
      "使用 React 的鼠标和触屏事件实现拖拽。用 SVG transform 实现旋转。碰撞检测使用 SAT（分离轴定理）算法精确判断多边形重叠。网格吸附功能支持正六边形和正三角形的专用密铺网格。",
    iterationIdeas: [
      "支持图形缩放。",
      "支持多点触控。",
      "添加自动对齐到相邻图形边缘。",
    ],
  },
  {
    id: "question-box",
    title: "课堂提问模块",
    implementationTime: "约10分钟（三级难度递进+升级动画+进度追踪）",
    teachingPurpose:
      "为教师提供随机课堂挑战，按观察、推理、创造三级难度递进，帮助学生从浅入深地思考密铺问题，激发课堂讨论。",
    aiContribution:
      "教师可以说：请帮我设计一个随机挑战按钮，问题分三级难度，答够几题自动升级，让学生越挑战越深入。AI 可以生成层层递进的教学问题并实现难度递进逻辑。",
    promptExample:
      "请为《奇妙的图形密铺》设计一组课堂挑战问题，分三级难度（观察类★、推理类★★、创造类★★★），每级随机出题，答够2~3题自动升级到下一难度，带升级动画和进度条。",
    technicalIdea:
      "问题按星级分类存储，用 React state 管理当前难度级别、已答题数和升级目标。每级随机抽取未出过的题目，达到目标数量后触发升级动画（setTimeout + CSS transition），自动切换到下一难度。进度条和星级指示器实时反映当前状态。",
    iterationIdeas: [
      "支持教师自定义添加问题。",
      "加入计时器，提示学生思考时间。",
      "记录每道题的学生回答。",
      "支持学生自选难度级别。",
    ],
  },
  {
    id: "classroom-flow",
    title: "课堂流程侧栏",
    implementationTime: "约8分钟（折叠侧栏导航+滚动定位+拖拽重定位+触屏适配）",
    teachingPurpose:
      "为教师提供清晰的课堂流程导航，让教师知道按什么顺序引导学生，每个环节可以一键切换到对应模块。侧栏可拖拽调整位置，触屏设备上不会误触滚动页面。",
    aiContribution:
      "教师可以说：请加入一个课堂流程侧栏，展示看一看、想一想、试一试、说一说、画一画、找一找六个环节，每个环节可以点击切换到对应区域，侧栏还能上下拖动调整位置，在平板上操作不会误滚动页面。AI 可以实现折叠式侧栏导航并处理触屏交互。",
    promptExample:
      "请设计一个折叠式课堂流程侧栏，包含六个教学环节，每个环节旁边有按钮可以跳转到页面中的对应演示模块。侧栏可以上下拖拽调整位置，触屏设备上操作不会导致页面滚动。",
    technicalIdea:
      "用 React state 管理侧栏折叠状态和当前活动环节。用 scrollIntoView 实现跳转。拖拽重定位通过 mousedown/touchstart 记录起始位置，mousemove/touchmove 实时更新 top 值，区分拖拽与点击避免误触。CSS touch-action: none 阻止触屏滚动穿透，touchmove 事件 passive: false 配合 preventDefault 防止页面跟随滚动。",
    iterationIdeas: [
      "记录当前教学进度，自动高亮当前环节。",
      "支持教师自定义环节顺序。",
      "生成课堂时间规划建议。",
    ],
  },
  {
    id: "summary-panel",
    title: "总结区",
    implementationTime: "约3分钟（可折叠面板+知识点列表）",
    teachingPurpose:
      "在课堂结尾帮助学生回顾和整理本节核心知识点，形成完整的知识结构。",
    aiContribution:
      "教师可以说：请设计一个可折叠的总结区，列出密铺的核心概念和发现。AI 可以整理出 4 条关键结论。",
    promptExample:
      "请设计一个可折叠的课堂总结区，标题为'今天我们发现了什么？'，内容概括密铺学习的主要发现。",
    technicalIdea:
      "简单的可折叠面板组件，用 CSS transition 实现展开/折叠动画。内容用列表形式呈现。",
    iterationIdeas: [
      "支持学生互动填写的总结模板。",
      "生成可打印的课堂笔记。",
      "录制课堂总结语音。",
    ],
  },
  {
    id: "teacher-mode",
    title: "教师模式",
    implementationTime: "约5分钟（React Context全局状态+条件渲染）",
    teachingPurpose:
      "课堂演示时只显示图形和问题，让学生先观察猜想；教师模式开启后显示结论和教学提示，支持教师讲解验证。",
    aiContribution:
      "教师可以说：请加入一个教师模式开关，关闭时学生只能看到图形和问题，打开后才能看到结论和提示。AI 可以实现全局状态管理，控制各模块的信息显示层级。",
    promptExample:
      "请为网页添加教师模式，关闭时隐藏数学结论和教学提示，打开后显示完整信息。",
    technicalIdea:
      "用 React Context 实现全局教师模式状态，所有组件通过 useContext 读取状态并据此显示/隐藏结论内容。",
    iterationIdeas: [
      "支持学生模式和教师模式之间的渐进过渡。",
      "教师可以自定义哪些内容在普通模式下可见。",
      "加入密码保护。",
    ],
  },
  {
    id: "github-pages",
    title: "GitHub Pages 部署",
    implementationTime: "约10分钟（Vite配置+GitHub Actions工作流）",
    teachingPurpose:
      "让教师无需服务器就能把网页部署到公网，方便课堂使用和分享。展示如何用 GitHub Actions 自动构建和部署。",
    aiContribution:
      "教师可以说：请帮我把这个网页部署到 GitHub Pages，让其他人也能访问。AI 可以配置 Vite 的 base 路径、编写 GitHub Actions 工作流、添加部署说明。",
    promptExample:
      "请为这个 Vite React 项目配置 GitHub Pages 自动部署：设置正确的 base 路径，编写 GitHub Actions deploy 工作流，推送到 main 分支时自动构建发布。",
    technicalIdea:
      "Vite 配置 base 为仓库名二级路径；GitHub Actions 使用官方 actions/configure-pages、upload-pages-artifact、deploy-pages 三个 action。",
    iterationIdeas: [
      "支持自定义域名配置。",
      "添加部署状态监控。",
      "支持多环境部署。",
    ],
  },
];

export function getAIExplanation(id: string): AIExplanation | undefined {
  return aiExplanations.find((e) => e.id === id);
}
