//业务类型
const businessType = [
  {
    value: 'financialData',
    label: "金融指标补录",
    icon: 'Money'
  }, {
    value: 'personData',
    label: "人员信息统计",
    icon: 'UserFilled'
  }, {
    value: 'limsData',
    label: '实验室数据采集',
    icon: 'Odometer',
  }, {
    value: 'customDesigner',
    label: '自定义设计 ',
    icon: 'DataBoard'
  }
]

//流程步骤
const operateSteps = [
  {
    value: 'preview',
    label: '模板预览',
    router: "/preview"
  }, {
    value: 'write',
    label: '数据填报',
    router: "/fill"
  }, {
    value: 'summary',
    label: '数据汇总',
    router: '/summary'
  }
]

//用户池
const users = [
  {
    userId: 0,
    userName: '管理员',
    isAdmin: true
  },
  {
    userId: 1,
    userName: '张三'
  }, {
    userId: 2,
    userName: '李四'
  }, {
    userId: 3,
    userName: '王五'
  }, 
  {
    userId: 4,
    userName: '赵六'
  }  
]

const initialPersonData = {
  employDate: new Date(),
  name: '张三',
  sex: '男',
  number: null,
  birthday: null,
  country: null,
  province: null,
  nation: null,
  iaMarry: null,
  isHealth: null,
  politic: null,
  height: null,
  weight: null,
  vision: null,
  education: null,
  subject: null,
  specialSkill: null,
  idCard: null,
  photo: null,
  homeAddress: null,
  telephone: null,
  email: null,
  educationHistory: [
    {
      time: null,
      school: null,
      subject: null,
      level: null
    }, {
      time: null,
      school: null,
      subject: null,
      level: null
    }, {
      time: null,
      school: null,
      subject: null,
      level: null
    }, {
      time: null,
      school: null,
      subject: null,
      level: null
    }
  ],
  workHistory: [
    {
      time: null,
      company: null,
      job: null,
      leaveReason: null
    }, {
      time: null,
      company: null,
      job: null,
      leaveReason: null
    }, {
      time: null,
      company: null,
      job: null,
      leaveReason: null
    }, {
      time: null,
      company: null,
      job: null,
      leaveReason: null
    },
  ],
  selfEvaluate: null
}

const initialFinancialData = {
  "资产-期末余额": {
    "货币资金": 58000,
    "应收账款": 12860,
    "应收利息": 8400,
    "预付账款": 12660,
    "其他应收款": 7800,
    "存货": 5990,
    "长期应收款": 35020,
    "长期股权投资": 65550,
    "投资性房地产": 45880,
    "固定资产": 370000,
    "油气资产": 655000,
    "在建工程": 785400

  },
  "资产-年初余额": {
    "货币资金": null,
    "应收账款": null,
    "应收利息": null,
    "预付账款": null,
    "其他应收款": null,
    "存货": null,
    "长期应收款": null,
    "长期股权投资": null,
    "投资性房地产": null,
    "固定资产": null,
    "油气资产": null,
    "在建工程": null

  },
  "负债-期末余额": {
    "短期借款": null,
    "交易性金融负债": null,
    "应付票据": null,
    "应交税费": null,
    "应付股利": null,
    "其他应付款": null,
    "长期借款": null,
    "应付债券": null,
    "长期应付款": null,
    "专项应付款": null,
    "递延所得税负债": null,
    "预计负债": null

  },
  "负债-年初余额": {
    "短期借款": null,
    "交易性金融负债": null,
    "应付票据": null,
    "应交税费": null,
    "应付股利": null,
    "其他应付款": null,
    "长期借款": null,
    "应付债券": null,
    "长期应付款": null,
    "专项应付款": null,
    "递延所得税负债": null,
    "预计负债": null

  },
  "sum": {
    "流动资产-期末余额": null,
    "流动资产-年初余额": null,
    "非流动资产-期末余额": null,
    "非流动资产-年初余额": null,
    "流动负债-期末余额": null,
    "流动负债-年初余额": null,
    "非流动负债-期末余额": null,
    "非流动负债-年初余额": null,
    "资产总计-期末余额": null,
    "资产总计-年初余额": null,
    "负债总计-期末余额": null,
    "负债总计-年初余额": null

  }
}

const initialLimsData = {
  "记录编号": "2023030500008",
  "证书编号": "ZS855447773",
  "受控号": "85",
  "标题": "氢氧化钠样品纯度测定",
  "客户名称": "西安葡萄城",
  "联系地址": "西安市高新区高新六路34号",
  "器具名称": "试管",
  "制造单位": "xxxx器材制造公司",
  "型号规格": "SG50-300",
  "器具编号": "8568872",
  "唯一性标识号": "Ven8997",
  "接收状态": "未接受",
  "温度": "21",
  "相对湿度": "35",
  "检定地点": "西安市计量检定局",
  "其它": "无",
  "检定员": "Matthew",
  "检定日期": "2023.3.5",
  "核验员": "Winny",
  "批准人": "Dexter",
  "检定依据": "GB-85477",
  "计量标准装置": [
    {
      "计量标准名称": "GB-447526",
      "计量标准测量范围": "99.99%",
      "计量标准等级": "5级",
      "计量标准证书号": "8547577521",
      "计量标准有效期至": "2034-12-31"
    }
  ]
}

const initialTaskSplit = {
  table: [{
    "序号": 1,
    "事项": "表设计",
    "完成时间": new Date(),
    "负责人": "张三",
    "参与人": "李四",
    "所需工时": "4人天",
    "重要程度": "5",
    "备注": "remark",
  }, {},{},{},{},{},{},{},{},{},{},{},{},{}]
}

const initialCustomDesigner = {
  
}

export default {
  businessType,
  operateSteps,
  initialPersonData,
  initialFinancialData,
  initialLimsData,
  initialTaskSplit,
  initialCustomDesigner,
  users,
}