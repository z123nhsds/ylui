YL.static = {
  /** "关于"信息 */
  softwareName: 'YLUI DEMO',
  version: "1.2.0",
  iconBtnStart: 'yoast',
  author: 'YLUI Team',
  contactInformation: 'ylui@yuri2.cn',
  officialWebsite: 'https://ylui.yuri2.cn',
  welcome: '本网站UI由 YLUI 强力驱动\n更多信息：https://ylui.yuri2.cn',
  copyrightDetail: 'YLUI 桌面框架',
  otherStatements: '',

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** YLUI基础设置 */
  lang: 'zh-cn',
  localStorageName: "ylui-storage",
  lockedApps: ['yl-system', 'yl-color-picker', 'ylui-fa', 'yl-browser', 'ylui-documents'],
  trustedApps: ['yl-system'],
  debug: false,
  beforeOnloadEnable: true,
  WarningPerformanceInIE: true,
  languages: {},
  changeable: true,
  dataCenter: true,

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** YLUI注册信息 */
  authorization: '社区版',
  serialNumber: null,

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 数据存储配置 - 与后台接口对接 */
  dataStorage: {
    mode: 'localStorage',
    remote: {
      loadUrl: '/api/data/load',
      saveUrl: '/api/data/save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      autoSave: false,
      autoSaveInterval: 30000
    },
    hybrid: {
      preferLocal: true,
      syncInterval: 60000
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 应用组织框架配置 */
  appFramework: {
    enableCrossOriginCommunication: true,
    enableDataSerialization: true,
    serializationFormat: 'json',
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
    enabled: true,
    smallScreenWidth: 768,
    mobileMenuMode: 'bottom',
    touchGestures: true,
    mobileIconSize: 56,
    tabletIconSize: 60,
    desktopIconSize: 64,
    detectHorizontalScreen: true,
    horizontalScreenRatio: 1.3,
    tileSizes: {
      mobile: 60,
      tablet: 80,
      desktop: 100
    },
    taskBar: {
      mobileHeight: 48,
      tabletHeight: 40,
      desktopHeight: 40,
      mobileShowText: false
    },
    startMenu: {
      mobileWidthPercent: 100,
      tabletWidthPercent: 80,
      desktopWidth: 800,
      mobileShowTiles: false
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** Windows 风格组件配置 */
  windowsStyle: {
    startMenu: {
      blurEffect: true,
      position: 'bottom',
      animationDuration: 300
    },
    tiles: {
      animate: true,
      hoverScale: 1.05,
      borderRadius: 4
    },
    notification: {
      animate: true,
      duration: 5000,
      maxCount: 10,
      position: 'bottom-right'
    },
    taskBar: {
      position: 'bottom',
      autoHide: false,
      iconSize: 20
    }
  },

  /**————————————————————————————————————————————————————————————————————————————————————————————*/
  /** 可视化开发配置示例 */
  visualDevelopment: {
    workspaceExample: {
      namespace: 'ylui-workspace-demo',
      serializer: 'json',
      bridge: {
        requestAction: 'workspace:get',
        syncEvent: 'workspace:updated',
        targetApp: 'yl-system'
      },
      backend: {
        loadUrl: '/api/data/load',
        saveUrl: '/api/data/save'
      },
      launcher: {
        sidebarApps: ['yl-system', 'yl-browser', 'ylui-documents'],
        menuApps: ['yl-system', 'yl-browser', 'ylui-documents']
      },
      tiles: [
        { app: 'yl-system', title: '系统设置', group: '工作区', size: 'medium', color: '#0078D7' },
        { app: 'yl-browser', title: '业务看板', group: '工作区', size: 'wide', color: '#107C10' },
        { app: 'ylui-documents', title: '开发文档', group: '工作区', size: 'wide', color: '#D83B01' }
      ],
      notifications: [
        { title: '组织框架已启用', content: '跨域通信、Vue 序列化与后台存取接口已经可用。' }
      ]
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
   *   YL.setThemeColor('#FF5722');
   *   YL.open('yl-system');
   *   YL.msg('组织框架', '当前布局配置已生效');
   * });
   *
   * 跨域APP通信示例:
   *
   * YLApp.framework.handle('workspace:get', function(payload) {
   *   return { updatedAt: Date.now(), payload: payload };
   * });
   *
   * YLApp.requestApp('yl-system', 'workspace:get', { scope: 'dashboard' }, function(err, result) {
   *   if (!err) {
   *     console.log('收到数据:', result);
   *   }
   * });
   *
   * YLApp.broadcastApp('workspace:updated', { key: 'value' });
   *
   * var store = YLApp.createStore({
   *   namespace: 'ylui-workspace-demo',
   *   state: { filters: [], widgets: [] }
   * });
   *
   * console.log(store.serialize('json'));
   * store.save();
   *
   * 响应式布局使用示例:
   *
   * YL.onReady(function() {
   *   var runtime = YL.vue.runtime;
   *   console.log(runtime.isSmallScreen ? '当前设备: 手机/平板' : '当前设备: PC');
   *   console.log(runtime.isHorizontalScreen ? '当前屏幕: 横屏' : '当前屏幕: 竖屏');
   * });
   */

};
