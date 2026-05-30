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

// 跨域APP通信模块
YL.crossApp = {
  _listeners: {},
  _pendingRequests: {},
  _requestIdCounter: 0,
  _channels: {},

  init: function() {
    if (window.addEventListener) {
      window.addEventListener('message', this._handleMessage.bind(this));
    } else {
      window.attachEvent('onmessage', this._handleMessage.bind(this));
    }
    YL.debug('跨域APP通信模块已初始化');
  },

  _handleMessage: function(event) {
    var data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'ylui-crossapp-request':
        this._handleRequest(data);
        break;
      case 'ylui-crossapp-response':
        this._handleResponse(data);
        break;
      case 'ylui-crossapp-broadcast':
        this._handleBroadcast(data);
        break;
      case 'ylui-crossapp-subscribe':
        this._handleSubscribe(data);
        break;
    }
  },

  _handleRequest: function(data) {
    var requestId = data.requestId;
    var channel = data.channel;
    var method = data.method;
    var params = data.params;

    var result;
    var error = null;

    try {
      result = this._executeMethod(channel, method, params);
    } catch (e) {
      error = e.message || String(e);
      result = null;
    }

    this._sendResponse(requestId, data.from, { result: result, error: error });
  },

  _handleResponse: function(data) {
    var requestId = data.requestId;
    var callback = this._pendingRequests[requestId];
    if (callback) {
      callback(data.payload.error, data.payload.result);
      delete this._pendingRequests[requestId];
    }
  },

  _handleBroadcast: function(data) {
    var channel = data.channel;
    var eventName = data.event;
    var eventData = data.data;

    if (this._listeners[channel] && this._listeners[channel][eventName]) {
      this._listeners[channel][eventName].forEach(function(handler) {
        try {
          handler(eventData);
        } catch (e) {
          YL.debug('广播事件处理错误: ' + e);
        }
      });
    }
  },

  _handleSubscribe: function(data) {
    var channel = data.channel;
    var subscriberId = data.subscriberId;

    if (!this._channels[channel]) {
      this._channels[channel] = { subscribers: [] };
    }

    if (this._channels[channel].subscribers.indexOf(subscriberId) === -1) {
      this._channels[channel].subscribers.push(subscriberId);
    }
  },

  _executeMethod: function(channel, method, params) {
    var appFramework = YL.static.appFramework;
    if (!appFramework || !appFramework.enableCrossOriginCommunication) {
      throw new Error('跨域通信未启用');
    }

    switch (method) {
      case 'getAppData':
        return YL.util.dataCopy('apps');
      case 'getConfigs':
        return YL.util.dataCopy('configs');
      case 'getTiles':
        return YL.util.dataCopy('tiles');
      case 'getShortcuts':
        return YL.util.dataCopy('shortcuts');
      case 'getStartMenu':
        return YL.util.dataCopy('startMenu');
      case 'setData':
        var key = params.key;
        var value = params.value;
        if (YL.vue) {
          YL.vue.$set(YL.vue, key, value);
        }
        return true;
      case 'openApp':
        var appId = params.appId;
        var options = params.options || {};
        YL.open(appId, options);
        return true;
      case 'closeApp':
        var winId = params.winId;
        if (YL.vue) {
          YL.vue.winClose(winId);
        }
        return true;
      case 'exportData':
        return YL.export();
      case 'importData':
        var jsonData = params.data;
        YL.import(jsonData);
        return true;
      default:
        throw new Error('未知方法: ' + method);
    }
  },

  _sendResponse: function(requestId, target, payload) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'ylui-crossapp-response',
        requestId: requestId,
        payload: payload
      }, '*');
    } else if (YL.vue) {
      var wins = YL.vue.wins;
      for (var id in wins) {
        if (wins[id] && wins[id].app === target) {
          var iframe = document.getElementById(id);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'ylui-crossapp-response',
              requestId: requestId,
              payload: payload
            }, '*');
          }
        }
      }
    }
  },

  request: function(targetAppId, method, params, callback) {
    var requestId = ++this._requestIdCounter;
    this._pendingRequests[requestId] = callback;

    var message = {
      type: 'ylui-crossapp-request',
      requestId: requestId,
      channel: 'ylui',
      from: YLApp ? YLApp.id : 'desktop',
      target: targetAppId,
      method: method,
      params: params
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    } else if (targetAppId && YL.vue && YL.vue.wins) {
      for (var id in YL.vue.wins) {
        var win = YL.vue.wins[id];
        if (win && win.app === targetAppId) {
          var iframe = document.getElementById(id);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(message, '*');
          }
        }
      }
    }

    setTimeout(function() {
      if (YL.crossApp._pendingRequests[requestId]) {
        delete YL.crossApp._pendingRequests[requestId];
        if (callback) callback('Request timeout', null);
      }
    }, 30000);
  },

  broadcast: function(eventName, eventData) {
    var message = {
      type: 'ylui-crossapp-broadcast',
      channel: 'ylui',
      from: YLApp ? YLApp.id : 'desktop',
      event: eventName,
      data: eventData
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }

    if (YL.vue && YL.vue.wins) {
      for (var id in YL.vue.wins) {
        var iframe = document.getElementById(id);
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(message, '*');
        }
      }
    }
  },

  on: function(eventName, handler) {
    var channel = 'ylui';
    if (!this._listeners[channel]) {
      this._listeners[channel] = {};
    }
    if (!this._listeners[channel][eventName]) {
      this._listeners[channel][eventName] = [];
    }
    this._listeners[channel][eventName].push(handler);
  },

  off: function(eventName, handler) {
    var channel = 'ylui';
    if (!this._listeners[channel] || !this._listeners[channel][eventName]) return;

    var handlers = this._listeners[channel][eventName];
    var index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  },

  serialize: function(data, format) {
    var appFramework = YL.static.appFramework;
    format = format || (appFramework && appFramework.serializationFormat) || 'json';

    switch (format) {
      case 'json':
        return JSON.stringify(data);
      case 'xml':
        return this._toXML(data);
      default:
        return JSON.stringify(data);
    }
  },

  deserialize: function(str, format) {
    var appFramework = YL.static.appFramework;
    format = format || (appFramework && appFramework.serializationFormat) || 'json';

    switch (format) {
      case 'json':
        return JSON.parse(str);
      case 'xml':
        return this._fromXML(str);
      default:
        return JSON.parse(str);
    }
  },

  _toXML: function(obj, rootName) {
    rootName = rootName || 'root';
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<' + rootName + '>';

    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        xml += '\n<array>';
        obj.forEach(function(item, index) {
          xml += '\n<item index="' + index + '">';
          xml += this._toXML(item, 'item');
          xml += '</item>';
        }.bind(this));
        xml += '\n</array>';
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            var safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
            xml += '\n<' + safeKey + '>';
            if (typeof value === 'object' && value !== null) {
              xml += this._toXML(value, safeKey);
            } else if (typeof value === 'string') {
              xml += '<![CDATA[' + value + ']]>';
            } else {
              xml += String(value);
            }
            xml += '</' + safeKey + '>';
          }
        }
      }
    } else {
      xml += String(obj);
    }

    xml += '\n</' + rootName + '>';
    return xml;
  },

  _fromXML: function(xmlStr) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

    var parseNode = function(node) {
      if (node.nodeType === 3) {
        var text = node.textContent.trim();
        if (text === '') return null;
        var num = Number(text);
        if (!isNaN(num)) return num;
        if (text === 'true') return true;
        if (text === 'false') return false;
        return text;
      }

      if (node.nodeType === 1) {
        var obj = {};
        var children = node.childNodes;
        var textContent = '';

        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.nodeType === 1) {
            var key = child.nodeName.replace(/[^a-zA-Z0-9_]/g, '_');
            var value = parseNode(child);
            if (value !== null) {
              obj[key] = value;
            }
            textContent = '';
          } else if (child.nodeType === 3) {
            textContent += child.textContent;
          }
        }

        if (Object.keys(obj).length === 0) {
          var text = textContent.trim();
          var num = Number(text);
          if (!isNaN(num)) return num;
          if (text === 'true') return true;
          if (text === 'false') return false;
          return text;
        }

        return obj;
      }

      return null;
    };

    var root = xmlDoc.documentElement;
    var result = parseNode(root);
    return result;
  }
};

if (YL.static.appFramework && YL.static.appFramework.enableCrossOriginCommunication) {
  YL.crossApp.init();
}