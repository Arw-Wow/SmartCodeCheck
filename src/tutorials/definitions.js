export const TOUR_VERSION = 1

export const TOUR_DEFINITIONS = [
  {
    key: 'home',
    routeName: 'Home',
    title: '首页导览',
    steps: [
      {
        target: 'home-primary-actions',
        title: '从主要入口开始',
        body: '工作台用于单段代码深度分析，代码对比用于比较两种实现。'
      },
      {
        target: 'home-feature-overview',
        title: '了解平台能力',
        body: '这里概览规则、模型、结果解释和批量交付能力。'
      }
    ]
  },
  {
    key: 'workspace',
    routeName: 'Workspace',
    title: '工作台导览',
    steps: [
      {
        target: 'workspace-config',
        title: '配置检测范围',
        body: '选择语言、模型、检测维度和规范文档规则集，决定本次分析标准。'
      },
      {
        target: 'workspace-editor',
        title: '准备代码',
        body: '在编辑器中粘贴、编写或上传代码；分析后的问题会定位到对应行。'
      },
      {
        target: 'workspace-analyze',
        title: '开始深度分析',
        body: '点击后会执行静态分析与 AI 检测，过程中可以终止。'
      },
      {
        target: 'workspace-results',
        title: '查看和复核结果',
        body: '结果区包含评分、问题列表、质量摘要、历史记录和导出入口。'
      }
    ]
  },
  {
    key: 'comparison',
    routeName: 'Comparison',
    title: '代码对比导览',
    steps: [
      {
        target: 'comparison-config-toggle',
        title: '展开对比配置',
        body: '这里选择语言、模型和对比维度，适合按同一标准评估两段实现。'
      },
      {
        target: 'comparison-editors',
        title: '输入两个版本',
        body: '左侧放 Code A，右侧放 Code B，再运行对比。'
      },
      {
        target: 'comparison-run',
        title: '运行对比',
        body: '执行后会生成总结、分数、雷达图和维度差异。'
      },
      {
        target: 'comparison-results',
        title: '沉淀报告',
        body: '对比结果可查看历史，也可以导出 JSON 或 Markdown。'
      }
    ]
  },
  {
    key: 'dashboard',
    routeName: 'Dashboard',
    title: '统计中心导览',
    steps: [
      {
        target: 'dashboard-overview',
        title: '看整体质量画像',
        body: '顶部指标汇总分析次数、平均分、问题数量和高危占比。'
      },
      {
        target: 'dashboard-trend',
        title: '追踪质量趋势',
        body: '趋势图展示得分和问题数量变化，用于复盘改进效果。'
      },
      {
        target: 'dashboard-breakdowns',
        title: '定位问题构成',
        body: '按严重级别、来源、维度、语言和模型拆分问题。'
      }
    ]
  },
  {
    key: 'rulesets',
    routeName: 'RuleSets',
    title: '规则集导览',
    steps: [
      {
        target: 'rulesets-usage',
        title: '理解规则集流程',
        body: '上传规范文档后，可以在工作台把它作为额外检测标准。'
      },
      {
        target: 'rulesets-form',
        title: '创建或编辑规则集',
        body: '填写名称并上传或粘贴团队规范、课程 Rubric 或安全要求。'
      },
      {
        target: 'rulesets-list',
        title: '管理已有规则',
        body: '已有规则集可编辑、删除，并在工作台分析前选择启用。'
      }
    ]
  },
  {
    key: 'evaluations',
    routeName: 'Evaluations',
    title: '批量检测导览',
    steps: [
      {
        target: 'evaluations-config',
        title: '设置批量检测策略',
        body: '选择快速、智能或深度模式，并配置模型、维度和统一指令。'
      },
      {
        target: 'evaluations-jsonl',
        title: '上传样本',
        body: '支持 JSONL、多行 JSON 对象或 JSON 数组，每条样本包含 id、language、code。'
      },
      {
        target: 'evaluations-run',
        title: '运行批量检测',
        body: '提交后系统逐条分析样本，并生成批量任务记录。'
      },
      {
        target: 'evaluations-results',
        title: '查看和导出报告',
        body: '选择历史任务查看样本报告，并导出 JSON 或 CSV。'
      }
    ]
  },
  {
    key: 'model-settings',
    routeName: 'ModelSettings',
    title: '模型配置导览',
    steps: [
      {
        target: 'model-settings-form',
        title: '保存模型配置',
        body: '填写模型名称、Base URL 和提供方，用于后续分析调用。'
      },
      {
        target: 'model-settings-list',
        title: '检查模型状态',
        body: '已保存模型会显示在列表中，可以执行连通性检查。'
      }
    ]
  }
]

export const TOUR_DEFINITION_MAP = Object.fromEntries(
  TOUR_DEFINITIONS.map(definition => [definition.key, definition])
)

export const TOUR_ROUTE_MAP = Object.fromEntries(
  TOUR_DEFINITIONS.map(definition => [definition.routeName, definition])
)
