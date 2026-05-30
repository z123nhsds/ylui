YL.static = {
  /** "关于"信息 */
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
      '#FFB900', '#FF8C00', '#F7630C', '#CA5010', '#DA3B01', '#EF6950',
      '#D13438', '#E74856', '#E81123', '#EA005E', '#C30052', '#E3008C',
      '#BF0077', '#C239B3', '#9A0089', '#0078D7', '#0063B1', '#8E8CD8',
      '#6B69D6', '#8764B8', '#744DA9', '#B146C2', '#881798', '#0099BC',
      '#2D7D9A', '#00B7C3', '#038387', '#00B294', '#018574', '#00CC6A', '#10893E'
    ]
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 响应式布局配置 - PC/平板/手机适配 */
  responsive: {
    // 是否启用响应式布局
    enabled: true,
    // 小屏幕判定阈值 (px) - 平板/手机
    smallScreenWidth: 768,
    // 移动端菜单模式: 'left' | 'bottom'
    mobileMenuMode: 'bottom',
    // 是否允许手势操作
    touchGestures: true,
    // 移动端图标尺寸
    mobileIconSize: 56,
    // 平板图标尺寸
    tabletIconSize: 60,
    // PC图标尺寸
    desktopIconSize: 64,
    // 是否启用水平屏幕检测
    detectHorizontalScreen: true,
    // 水平屏幕判定阈值 (比例)
    horizontalScreenRatio: 1.3,
    // 磁贴尺寸配置
    tileSizes: {
      mobile: 60,
      tablet: 80,
      desktop: 100
    },
    // 任务栏配置
    taskBar: {
      // 移动端任务栏高度
      mobileHeight: 48,
      // 平板任务栏高度
      tabletHeight: 40,
      // PC任务栏高度
      desktopHeight: 40,
      // 是否在移动端显示文字
      mobileShowText: false
    },
    // 开始菜单配置
    startMenu: {
      // 移动端宽度 (百分比)
      mobileWidthPercent: 100,
      // 平板宽度 (百分比)
      tabletWidthPercent: 80,
      // PC宽度 (固定值)
      desktopWidth: 800,
      // 是否显示磁贴 (移动端)
      mobileShowTiles: false
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** Windows 风格组件配置 */
  windowsStyle: {
    // 开始菜单
    startMenu: {
      // 是否启用玻璃模糊效果
      blurEffect: true,
      // 菜单位置: 'bottom' | 'left'
      position: 'bottom',
      // 菜单动画时长 (ms)
      animationDuration: 300
    },
    // 磁贴
    tiles: {
      // 是否启用动态磁贴效果
      animate: true,
      // 磁贴悬停缩放比例
      hoverScale: 1.05,
      // 磁贴圆角大小
      borderRadius: 4
    },
    // 通知中心
    notification: {
      // 是否启用通知动画
      animate: true,
      // 通知停留时间 (ms)
      duration: 5000,
      // 最大通知数量
      maxCount: 10,
      // 通知位置: 'bottom-right' | 'bottom-left'
      position: 'bottom-right'
    },
    // 任务栏
    taskBar: {
      // 任务栏位置: 'bottom' | 'top'
      position: 'bottom',
      // 是否自动隐藏
      autoHide: false,
      // 任务栏图标大小
      iconSize: 20
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 可视化开发配置示例 (configs.js)
   *
   * 本文件是 YLUI 的配置文件，可以通过 onLoad.js 中的 YL.onLoad() 钩子进行动态修改
   *
   * 使用示例:
   *
   * YL.onLoad(function() {
   *   // 修改主题色
   *   YL.setThemeColor('#FF5722');
   *
   *   // 打开指定应用
   *   YL.open('yl-system');
   *
   *   // 监听应用事件
   *   YL.crossApp.on('appOpened', function(data) {
   *     console.log('应用已打开:', data);
   *   });
   * });
   *
   * 跨域APP通信示例:
   *
   * // 发送请求到其他APP
   * YL.crossApp.request('target-app-id', 'getData', {}, function(err, result) {
   *   if (!err) {
   *     console.log('收到数据:', result);
   *   }
   * });
   *
   * // 广播事件到所有APP
   * YL.crossApp.broadcast('dataUpdated', { key: 'value' });
   *
   * // 序列化数据
   * var jsonStr = YL.crossApp.serialize({ foo: 'bar' }, 'json');
   * var xmlStr = YL.crossApp.serialize({ foo: 'bar' }, 'xml');
   *
   * 响应式布局使用示例:
   *
   * YL.onLoad(function() {
   *   var runtime = YL.vue.runtime;
   *
   *   // 检测设备类型
   *   if (runtime.isSmallScreen) {
   *     console.log('当前设备: 手机/平板');
   *   } else {
   *     console.log('当前设备: PC');
   *   }
   *
   *   // 检测屏幕方向
   *   if (runtime.isHorizontalScreen) {
   *     console.log('当前屏幕: 横屏');
   *   } else {
   *     console.log('当前屏幕: 竖屏');
   *   }
   * });
   */

};
