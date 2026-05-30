YL.static = {
  /** “关于”信息 */
  softwareName: 'YLUI DEMO', //网站名。请在此处填写您自己的网站名，如王小明的博客
  version: "1.2.0", // 网站版本号
  iconBtnStart: 'yoast', //主图标
  author: 'YLUI Team',//作者
  contactInformation: 'ylui@yuri2.cn',//联系方式
  officialWebsite: 'https://ylui.yuri2.cn',//软件官网
  welcome: '本网站UI由 YLUI 强力驱动\n更多信息：https://ylui.yuri2.cn',//加载完毕控制台提示信息
  copyrightDetail: 'YLUI 桌面框架',//版权详细信息
  otherStatements: '',//其他信息（可留空）

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** YLUI基础设置 */
  lang: 'zh-cn', //语言
  localStorageName: "ylui-storage", //ls存储名
  lockedApps: ['yl-system', 'yl-color-picker', 'ylui-fa', 'yl-browser', 'ylui-documents'], // 锁定的应用（不允许被脚本修改）
  trustedApps: ['yl-system'], // 受信任的应用（可以使用敏感API）
  debug: false,//启用更多调试信息
  beforeOnloadEnable: true,//启用关闭前询问（打包app时请关闭防止出错）
  WarningPerformanceInIE: true,//在IE下提示体验不佳信息
  languages: {}, //推荐留空，自动从文件加载
  changeable: true,//存档数据是否可被普通用户修改
  dataCenter: true,//是否展示数据管理中心

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** YLUI注册信息 */
  authorization: '社区版',//授权类型
  serialNumber: null,//序列号

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 数据存储配置 - 与后台接口对接 */
  dataStorage: {
    // 数据加载方式: 'localStorage' | 'remote' | 'hybrid'
    mode: 'localStorage',
    
    // 远程接口配置 (当 mode 为 'remote' 或 'hybrid' 时使用)
    remote: {
      // 数据加载接口
      loadUrl: '/api/data/load',
      // 数据保存接口
      saveUrl: '/api/data/save',
      // 请求方法
      method: 'POST',
      // 请求头
      headers: {
        'Content-Type': 'application/json'
      },
      // 请求超时时间(毫秒)
      timeout: 30000,
      // 是否启用自动保存
      autoSave: false,
      // 自动保存间隔(毫秒)
      autoSaveInterval: 30000
    },
    
    // 混合模式配置 (当 mode 为 'hybrid' 时使用)
    hybrid: {
      // 优先使用本地存储
      preferLocal: true,
      // 后台同步间隔(毫秒)
      syncInterval: 60000
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 应用组织框架配置 */
  appFramework: {
    // 是否启用跨域 APP 通信
    enableCrossOriginCommunication: true,
    // 是否启用数据序列化
    enableDataSerialization: true,
    // 数据序列化格式: 'json' | 'xml'
    serializationFormat: 'json',
    // 主题色
    themeColors: [
      '#FFB900',
      '#FF8C00',
      '#F7630C',
      '#CA5010',
      '#DA3B01',
      '#EF6950',
      '#D13438',
      '#E74856',
      '#E81123',
      '#EA005E',
      '#C30052',
      '#E3008C',
      '#BF0077',
      '#C239B3',
      '#9A0089',
      '#0078D7',
      '#0063B1',
      '#8E8CD8',
      '#6B69D6',
      '#8764B8',
      '#744DA9',
      '#B146C2',
      '#881798',
      '#0099BC',
      '#2D7D9A',
      '#00B7C3',
      '#038387',
      '#00B294',
      '#018574',
      '#00CC6A',
      '#10893E'
    ]
  }

};
