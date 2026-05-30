YL.export = function () {
  var rel = {};
  var vue = YL.vue;
  rel.configs = YL.util.dataCopy('configs');
  rel.apps = YL.util.dataCopy('apps');
  var shortcuts = YL.util.dataCopy('shortcuts');
  shortcuts.forEach(function (shortcut) {
    delete shortcut.drag;
    if (shortcut.children) {
      shortcut.children.forEach(function (t) {
        delete t.drag;
      })
    }
  });
  rel.shortcuts = shortcuts;
  var tiles = YL.util.dataCopy('tiles');
  tiles.forEach(function (tileGroup) {
    tileGroup.data.forEach(function (t) {
      delete t.moved;
    })
  });
  rel.tiles = tiles;
  var startMenu = YL.util.dataCopy('startMenu');
  delete startMenu.open;
  delete startMenu.sidebar.open;
  startMenu.sidebar = startMenu.sidebar.btns;
  var removeMenuAttrOpen = function (item) {
    delete item.open;
    if (item.children) {
      for (var i in item.children) {
        var child = item.children[i];
        removeMenuAttrOpen(child);
      }
    }
  };
  for (var i in startMenu.menu) {
    var item = startMenu.menu[i];
    removeMenuAttrOpen(item);
  }
  rel.startMenu = startMenu;
  rel.version = YL.info.version;
  rel.timestamp = Date.now();
  return rel;
};

// 远程数据加载
YL.loadRemoteData = function(callback) {
  if (!YL.static.dataStorage || YL.static.dataStorage.mode === 'localStorage') {
    if (callback) callback(null, null);
    return;
  }
  
  var config = YL.static.dataStorage;
  var remote = config.remote;
  
  YL.debug('正在从远程服务器加载数据...');
  
  var xhr = new XMLHttpRequest();
  xhr.timeout = remote.timeout || 30000;
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          YL.debug('远程数据加载成功');
          if (callback) callback(null, data);
        } catch (e) {
          YL.debug('远程数据解析失败: ' + e);
          if (callback) callback(e, null);
        }
      } else {
        YL.debug('远程数据加载失败，状态码: ' + xhr.status);
        if (callback) callback(new Error('Failed to load data'), null);
      }
    }
  };
  
  xhr.onerror = function() {
    YL.debug('网络请求失败');
    if (callback) callback(new Error('Network error'), null);
  };
  
  xhr.ontimeout = function() {
    YL.debug('请求超时');
    if (callback) callback(new Error('Request timeout'), null);
  };
  
  xhr.open(remote.method || 'POST', remote.loadUrl);
  
  if (remote.headers) {
    for (var key in remote.headers) {
      xhr.setRequestHeader(key, remote.headers[key]);
    }
  }
  
  xhr.send();
};

// 远程数据保存
YL.saveRemoteData = function(data, callback) {
  if (!YL.static.dataStorage || YL.static.dataStorage.mode === 'localStorage') {
    if (callback) callback(null);
    return;
  }
  
  var config = YL.static.dataStorage;
  var remote = config.remote;
  
  YL.debug('正在保存数据到远程服务器...');
  
  var xhr = new XMLHttpRequest();
  xhr.timeout = remote.timeout || 30000;
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        YL.debug('数据保存成功');
        if (callback) callback(null);
      } else {
        YL.debug('数据保存失败，状态码: ' + xhr.status);
        if (callback) callback(new Error('Failed to save data'));
      }
    }
  };
  
  xhr.onerror = function() {
    YL.debug('网络请求失败');
    if (callback) callback(new Error('Network error'));
  };
  
  xhr.ontimeout = function() {
    YL.debug('请求超时');
    if (callback) callback(new Error('Request timeout'));
  };
  
  xhr.open(remote.method || 'POST', remote.saveUrl);
  
  if (remote.headers) {
    for (var key in remote.headers) {
      xhr.setRequestHeader(key, remote.headers[key]);
    }
  }
  
  var payload = JSON.stringify(data);
  xhr.send(payload);
};

// 格式化数据为运行时可用
YL.format = function (json) {
  var data = Yuri2.jsonMerge(YL._baseData(), json, true);
  for (var i in data.apps) {
    var app = Yuri2.jsonMerge(YL.util.getAppDataTemplate(), data.apps[i]);
    data.apps[i] = app;
  }
  data.shortcuts.forEach(function (shortcut) {
    shortcut.drag = { mDown: false, left: 0, top: 0, };
    if (shortcut.children) {
      shortcut.children.forEach(function (t) {
        t.drag = { mDown: false, left: 0, top: 0, };
      })
    }
  });
  data.startMenu.open = false;
  data.startMenu.sidebar = {
    btns: data.startMenu.sidebar
  };
  data.startMenu.sidebar.open = false;
  var addMenuAttrOpen = function (item) {
    item.open = false;
    if (item.children) {
      for (var i in item.children) {
        var child = item.children[i];
        addMenuAttrOpen(child);
      }
    }
  };
  for (var i in data.startMenu.menu) {
    var item = data.startMenu.menu[i];
    addMenuAttrOpen(item);
  }
  return data;
};

YL.import = function (json) {
  YL.reset();
  var data = YL.format(json);
  var vue = YL.vue;
  vue.$set(vue, 'apps', data.apps);
  for (var i in data) {
    if (i !== 'apps') {
      vue.$set(vue, i, data[i]);
    }
  }
  vue.initRuntime();
  
  // 如果启用了远程数据保存，自动保存
  if (YL.static.dataStorage && YL.static.dataStorage.remote && YL.static.dataStorage.remote.autoSave) {
    setTimeout(function() {
      YL.saveToRemote();
    }, 1000);
  }
};

// 保存数据到远程
YL.saveToRemote = function() {
  var data = YL.export();
  YL.saveRemoteData(data, function(err) {
    if (err) {
      YL.debug('自动保存失败: ' + err);
    }
  });
};

// 设置自动保存定时器
YL.setupAutoSave = function() {
  if (!YL.static.dataStorage || !YL.static.dataStorage.remote || !YL.static.dataStorage.remote.autoSave) {
    return;
  }
  
  var interval = YL.static.dataStorage.remote.autoSaveInterval || 30000;
  
  setInterval(function() {
    YL.saveToRemote();
  }, interval);
  
  YL.debug('自动保存已启用，间隔: ' + interval + 'ms');
};

// 数据同步管理器
YL.dataSync = {
  // 同步状态
  syncing: false,
  // 最后同步时间
  lastSyncTime: null,
  
  // 执行同步
  sync: function(callback) {
    var self = this;
    
    if (this.syncing) {
      if (callback) callback(new Error('Sync already in progress'));
      return;
    }
    
    if (!YL.static.dataStorage || YL.static.dataStorage.mode !== 'hybrid') {
      if (callback) callback(null);
      return;
    }
    
    this.syncing = true;
    YL.debug('开始数据同步...');
    
    // 混合模式同步逻辑
    // 1. 先保存本地更改
    var localData = YL.export();
    YL.saveToLocal(localData);
    
    // 2. 然后与服务器同步
    YL.saveRemoteData(localData, function(err) {
      self.syncing = false;
      self.lastSyncTime = Date.now();
      
      if (err) {
        YL.debug('数据同步失败: ' + err);
        if (callback) callback(err);
      } else {
        YL.debug('数据同步成功');
        if (callback) callback(null);
      }
    });
  },
  
  // 保存到本地
  saveToLocal: function(data) {
    var json = JSON.stringify(data);
    localStorage.setItem(YL.static.localStorageName, json);
  }
};

// 初始化数据存储
YL.initDataStorage = function() {
  var config = YL.static.dataStorage;
  
  if (!config) {
    return;
  }
  
  // 设置自动保存
  YL.setupAutoSave();
  
  // 混合模式下设置定期同步
  if (config.mode === 'hybrid' && config.hybrid && config.hybrid.syncInterval) {
    setInterval(function() {
      YL.dataSync.sync();
    }, config.hybrid.syncInterval);
    
    YL.debug('混合模式数据同步已启用，间隔: ' + config.hybrid.syncInterval + 'ms');
  }
};