/**
 * 读取配置示例文件
 * 修改此文件来实现持久化
 * YL.init(data) 中的data必须是ylui接受的数据格式
 * 开发者可以自行决定从静态文件读取（如basic.json）还是从远程服务器拉取（如ajax请求）
 */

YL.onLoad(function () {
  var load = Yuri2.parseURL().params.load;
  var file;
  var storageMode = YL.static.dataStorage && YL.static.dataStorage.mode || 'localStorage';
  var originalMsg = YL.msg;
  var runtimeEnhancementsInstalled = false;

  var installRuntimeEnhancements = function () {
    if (runtimeEnhancementsInstalled) {
      return;
    }
    runtimeEnhancementsInstalled = true;

    var applyPreviewIndexes = function () {
      if (!YL.vue || !YL.vue.msgPres) {
        return;
      }
      var previews = [];
      for (var id in YL.vue.msgPres) {
        if (YL.vue.msgPres[id]) {
          previews.push({
            id: id,
            createdAt: YL.vue.msgPres[id].createdAt || 0
          });
        }
      }
      previews.sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
      previews.forEach(function (item, index) {
        YL.vue.msgPres[item.id].index = index;
      });
    };

    YL.msg = function (title, content) {
      if (!YL.vue || !YL.vue.setWithID) {
        return originalMsg.call(YL, title, content);
      }
      var notification = YL.static.windowsStyle && YL.static.windowsStyle.notification || {};
      var duration = notification.duration || 5000;
      var maxCount = notification.maxCount || 10;
      var createdAt = Date.now();
      var options = {
        title: title,
        content: content,
        key: Math.random(),
        createdAt: createdAt
      };
      YL.vue.setWithID(YL.vue.center.msg, options, 'msg-');
      YL.vue.center.open || YL.vue.center.unread++;
      YL.vue.center.msgNum++;

      var previewIds = [];
      for (var previewId in YL.vue.msgPres) {
        if (YL.vue.msgPres[previewId]) {
          previewIds.push(previewId);
        }
      }
      if (previewIds.length >= maxCount) {
        previewIds.sort(function (a, b) {
          return (YL.vue.msgPres[a].createdAt || 0) - (YL.vue.msgPres[b].createdAt || 0);
        });
        YL.vue.msgPres[previewIds[0]] = null;
      }

      var msgPreID = YL.vue.setWithID(YL.vue.msgPres, Yuri2.jsonMerge(options, {
        index: 0
      }), 'msgPre-');
      applyPreviewIndexes();
      setTimeout(function () {
        if (YL.vue && YL.vue.msgPres && YL.vue.msgPres[msgPreID]) {
          YL.vue.msgPres[msgPreID] = null;
          applyPreviewIndexes();
        }
      }, duration);
      return msgPreID;
    };

    var applyRuntimeConfigs = function () {
      if (!YL.vue || !YL.vue.runtime) {
        return;
      }
      var responsive = YL.static.responsive || {};
      var responsiveTaskBar = responsive.taskBar || {};
      var responsiveStartMenu = responsive.startMenu || {};
      var tileSizes = responsive.tileSizes || {};
      var windowsTaskBar = YL.static.windowsStyle && YL.static.windowsStyle.taskBar || {};
      var clientSize = Yuri2.getClientSize();
      var smallScreenWidth = responsive.smallScreenWidth || 768;
      var isResponsiveEnabled = responsive.enabled !== false;
      var isTablet = clientSize.width > smallScreenWidth && clientSize.width <= 1024;
      var isSmallScreen = isResponsiveEnabled && clientSize.width <= smallScreenWidth;
      var taskBarHeight = isSmallScreen
        ? (responsiveTaskBar.mobileHeight || 48)
        : (isTablet ? (responsiveTaskBar.tabletHeight || 40) : (responsiveTaskBar.desktopHeight || 40));
      var iconSize = isSmallScreen
        ? (responsive.mobileIconSize || 56)
        : (isTablet ? (responsive.tabletIconSize || 60) : (responsive.desktopIconSize || 64));
      var tileSize = isSmallScreen
        ? (tileSizes.mobile || 60)
        : (isTablet ? (tileSizes.tablet || 80) : (tileSizes.desktop || 100));
      var menuWidth = isSmallScreen
        ? Math.round(clientSize.width * ((responsiveStartMenu.mobileWidthPercent || 100) / 100))
        : (isTablet
          ? Math.round(clientSize.width * ((responsiveStartMenu.tabletWidthPercent || 80) / 100))
          : (responsiveStartMenu.desktopWidth || 800));
      var horizontalRatio = responsive.horizontalScreenRatio || 1.3;
      var isHorizontalScreen = responsive.detectHorizontalScreen === false
        ? clientSize.width > clientSize.height
        : (clientSize.width / Math.max(clientSize.height, 1)) >= horizontalRatio;

      YL.vue.configs.topTaskBar = windowsTaskBar.position === 'top';
      YL.vue.runtime.clientSize.width = clientSize.width;
      YL.vue.runtime.clientSize.height = clientSize.height;
      YL.vue.runtime.desktopSize.width = clientSize.width;
      YL.vue.runtime.desktopSize.height = Math.max(clientSize.height - taskBarHeight, 0);
      YL.vue.runtime.isSmallScreen = isSmallScreen;
      YL.vue.runtime.isHorizontalScreen = isHorizontalScreen;
      YL.vue.startMenu.width = menuWidth;
      YL.vue.runtime.startMenu.width = Math.min(menuWidth, clientSize.width);
      YL.vue.runtime.startMenu.height = Math.min(YL.vue.startMenu.height, YL.vue.runtime.desktopSize.height);
      YL.vue.runtime.shortcutWidth = iconSize + 12;
      YL.vue.runtime.shortcutHeight = iconSize + (isSmallScreen ? 26 : 32);
      YL.vue.runtime.tileSize = tileSize;
      YL.vue.runtime.tilesWidth = (tileSize + 4) * 6;
      YL.vue.runtime.tilesGroupNum = isSmallScreen ? 1 : (isTablet ? 2 : 3);
      YL.vue.runtime.shortcutsGrid.x = parseInt(YL.vue.runtime.desktopSize.width / Math.max(YL.vue.runtime.shortcutWidth, 1));
      YL.vue.runtime.shortcutsGrid.y = parseInt(YL.vue.runtime.desktopSize.height / Math.max(YL.vue.runtime.shortcutHeight, 1));
    };

    YL.onReady(function () {
      applyRuntimeConfigs();
      window.addEventListener('resize', function () {
        setTimeout(applyRuntimeConfigs, 0);
      });
    });
  };

  installRuntimeEnhancements();

  if (storageMode === 'remote' || storageMode === 'hybrid') {
    YL.loadRemoteData(function(err, data) {
      if (!err && data) {
        YL.init(data);
        if (storageMode === 'hybrid' && YL.dataSync) {
          YL.dataSync.saveToLocal(data);
        }
        YL.initDataStorage && YL.initDataStorage();
      } else {
        YL.debug('远程加载失败，使用本地数据');
        loadLocalData();
      }
    });
  } else {
    loadLocalData();
  }

  function loadLocalData() {
    if (load === YL.static.localStorageName && localStorage.getItem(YL.static.localStorageName)) {
      YL.init();
      YL.initDataStorage && YL.initDataStorage();
      return;
    } else if (load === YL.static.localStorageName) {
      file = 'basic';
    }

    file = file || load || 'basic';
    var save = /^\w+$/.test(file) ? './saves/' + file + '.json' : file;
    Yuri2.loadContentFromUrl(save, 'GET', function (err, text) {
      if (!err) {
        var data = JSON.parse(text);
        YL.init(data);
        YL.initDataStorage && YL.initDataStorage();
      } else {
        alert('YLUI读取配置错误，初始化失败');
      }
    });
  }
});
