window.YLApp = {
  EVENTS: {
    DATA_CHANGED: 'dataChanged',
    OPEN: 'open',
    CLOSE: 'close',
    DESKTOP_MOUSE_MOVE: 'desktopMouseMove',
    DESKTOP_MOUSE_DOWN: 'desktopMouseDown',
    DESKTOP_MOUSE_UP: 'desktopMouseUp',
    DESKTOP_CLICK: 'desktopClick',
    RESIZE: 'resize',
  },
  METHODS: {
    GET_ID: 'getID',
    GET_VERSION: 'getVersion',
    HISTORY_BACK: 'historyBack',
    HISTORY_BACK_AVAILABLE: 'historyBackAvailable',
    HISTORY_FORWARD: 'historyForward',
    HISTORY_FORWARD_AVAILABLE: 'historyForwardAvailable',
    REFRESH: 'refresh',
    SET_WIN_DATA: 'setWinData',
    GET_WIN_DATA: 'getWinData',
    SET_WALLPAPER: 'setWallpaper',
    SET_THEME_COLOR: 'setThemeColor',
    GET_CONFIGS: 'getConfigs',
    GET_RUNTIME: 'getRuntime',
    OPEN: 'open',
    CLOSE: 'close',
    MINIMIZE: 'minimize',
    MAXIMIZE: 'maximize',
    HIDE: 'hide',
    SHOW: 'show',
    RESTORE: 'restore',
    MSG: 'msg',
    SIMPLE_MSG: 'simpleMsg',
    SET_APP_BADGE: 'setAppBadge',
    GET_APP_VERSION: 'getAppVersion',
    UNINSTALL: 'uninstall',
    IMPORT: 'import',
    EXPORT: 'export',
    EVAL: 'eval',
    SETUP: 'setup',
  },
  _idCounter: 0,
  _cbs: {},
  _cbReady: null,
  _created: false,
  _eventHandlers: [],
  id: "",
  secrete: '',
  data: null,
  oldHref: "",
  _dispatchEvent: function (msg) {
    this._eventHandlers.forEach(function (handler) {
      handler(msg);
    });
  },
  emit: function (event, data, target) {
    var session = this._idCounter++;
    parent.postMessage({
      from: [YLApp.id, YLApp.secrete],
      type: "ylui-emit",
      session: session,
      emit: {
        event: event,
        data: data,
        target: target
      }
    }, "*")
  },
  eval: function (method, data, cb) {
    var session = this._idCounter++;
    this._cbs[session] = cb;
    parent.postMessage({
      from: [YLApp.id, YLApp.secrete],
      type: "ylui-eval",
      session: session,
      eval: {
        method: method,
        data: data,
      }
    }, "*")
  },
  open: function (url) {
    this.eval('open', [{
      url: url,
    }]);
  },
  onEvent: function (cb) {
    if (typeof cb !== 'function') return;
    this._eventHandlers.push(cb);
  },
  onTilesUpdate: function (cb) {
    if (typeof cb !== 'function') return;
    this.onEvent(function (msg) {
      if (msg.event === 'tilesUpdated') {
        cb(msg.data);
      }
    });
  },
  getTiles: function (cb) {
    this.eval('getTilesData', {}, cb);
  },
  requestTilesSync: function () {
    this.eval('requestTilesSync', {});
  },
  onReady: function (cb) {
    if (this._cbReady === false) return;
    if (!cb) {
      cb = function () {
      }
    }
    this._cbReady = cb;
  },
  hashBugForIeFix: function () {
    document.body.focus();
  },
  getWinObject: function (id) {
    try {
      var win = parent.YL.vue.wins[id];
      var idIframe = win.idIframe;
      var iframe = parent.document.getElementById(idIframe);
      return iframe.contentWindow;
    } catch (e) {
      return null;
    }
  },
};

YLApp.framework = {
  _initialized: false,
  _winData: null,
  _listeners: {},
  _requestHandlers: {},
  _pendingRequests: {},
  init: function () {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    var that = this;
    YLApp.onEvent(function (msg) {
      that._handleEvent(msg);
    });
  },
  syncContext: function () {
    var that = this;
    this.init();
    if (!YLApp.id) {
      return;
    }
    YLApp.eval('getWinData', {}, function (winData) {
      that._winData = winData || {};
    });
  },
  _getAppId: function () {
    return this._winData && this._winData.app ? this._winData.app : null;
  },
  _normalizeObject: function (value) {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    if (typeof value === 'function') {
      return undefined;
    }
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return value.toISOString();
    }
    if (Array.isArray(value)) {
      var arr = [];
      for (var i = 0; i < value.length; i++) {
        var normalizedItem = this._normalizeObject(value[i]);
        if (typeof normalizedItem !== 'undefined') {
          arr.push(normalizedItem);
        }
      }
      return arr;
    }
    if (typeof value === 'object') {
      var rel = {};
      for (var key in value) {
        if (!Object.prototype.hasOwnProperty.call(value, key) || key === '__ob__') {
          continue;
        }
        var normalizedValue = this._normalizeObject(value[key]);
        if (typeof normalizedValue !== 'undefined') {
          rel[key] = normalizedValue;
        }
      }
      return rel;
    }
    return value;
  },
  serialize: function (data, format) {
    this.init();
    var normalized = this._normalizeObject(data);
    format = format || 'json';
    if (format === 'xml') {
      return this._toXML(normalized, 'payload');
    }
    return JSON.stringify(normalized);
  },
  deserialize: function (str, format) {
    this.init();
    format = format || 'json';
    if (format === 'xml') {
      return this._fromXML(str);
    }
    return JSON.parse(str);
  },
  _toXML: function (obj, rootName) {
    rootName = rootName || 'root';
    var xml = '<?xml version="1.0" encoding="UTF-8"?><' + rootName + '>';
    if (obj === null || typeof obj === 'undefined') {
      return xml + '</' + rootName + '>';
    }
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        xml += this._toXML(obj[i], 'item');
      }
      return xml + '</' + rootName + '>';
    }
    if (typeof obj === 'object') {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          xml += this._toXML(obj[key], key.replace(/[^a-zA-Z0-9_]/g, '_'));
        }
      }
      return xml + '</' + rootName + '>';
    }
    return xml + String(obj)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;') + '</' + rootName + '>';
  },
  _fromXML: function (xmlStr) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    var parseNode = function (node) {
      var elementChildren = [];
      for (var i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType === 1) {
          elementChildren.push(node.childNodes[i]);
        }
      }
      if (elementChildren.length === 0) {
        return node.textContent;
      }
      var rel = {};
      elementChildren.forEach(function (child) {
        var value = parseNode(child);
        if (typeof rel[child.nodeName] === 'undefined') {
          rel[child.nodeName] = value;
        } else if (Array.isArray(rel[child.nodeName])) {
          rel[child.nodeName].push(value);
        } else {
          rel[child.nodeName] = [rel[child.nodeName], value];
        }
      });
      return rel;
    };
    return parseNode(xmlDoc.documentElement);
  },
  on: function (eventName, handler) {
    this.init();
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(handler);
  },
  off: function (eventName, handler) {
    if (!this._listeners[eventName]) {
      return;
    }
    var handlers = this._listeners[eventName];
    var index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  },
  handle: function (action, handler) {
    this.init();
    this._requestHandlers[action] = handler;
  },
  send: function (targetAppId, eventName, payload) {
    this.init();
    YLApp.emit('framework:event', {
      name: eventName,
      payload: this._normalizeObject(payload),
      targetAppId: targetAppId || null,
      sourceAppId: this._getAppId(),
      sourceWindowId: YLApp.id,
      createdAt: Date.now()
    }, true);
  },
  broadcast: function (eventName, payload) {
    this.init();
    YLApp.emit('framework:event', {
      name: eventName,
      payload: this._normalizeObject(payload),
      sourceAppId: this._getAppId(),
      sourceWindowId: YLApp.id,
      createdAt: Date.now()
    }, true);
  },
  request: function (targetAppId, action, payload, callback) {
    this.init();
    var requestId = 'framework-' + Date.now() + '-' + (++YLApp._idCounter);
    var that = this;
    this._pendingRequests[requestId] = {
      callback: callback,
      timer: setTimeout(function () {
        if (that._pendingRequests[requestId]) {
          var cb = that._pendingRequests[requestId].callback;
          delete that._pendingRequests[requestId];
          cb && cb('Request timeout', null);
        }
      }, 30000)
    };
    YLApp.emit('framework:request', {
      requestId: requestId,
      action: action,
      payload: this._normalizeObject(payload),
      targetAppId: targetAppId || null,
      sourceAppId: this._getAppId(),
      sourceWindowId: YLApp.id,
      createdAt: Date.now()
    }, true);
  },
  createStore: function (options) {
    this.init();
    options = options || {};
    var that = this;
    var state = this._normalizeObject(options.state || {});
    if (typeof Vue !== 'undefined' && typeof Vue.observable === 'function') {
      state = Vue.observable(state);
    }
    var applyState = function (nextState) {
      nextState = that._normalizeObject(nextState || {});
      for (var key in state) {
        if (Object.prototype.hasOwnProperty.call(state, key) && !Object.prototype.hasOwnProperty.call(nextState, key)) {
          if (typeof Vue !== 'undefined' && typeof Vue.delete === 'function') {
            Vue.delete(state, key);
          } else {
            delete state[key];
          }
        }
      }
      for (var nextKey in nextState) {
        if (typeof Vue !== 'undefined' && typeof Vue.set === 'function') {
          Vue.set(state, nextKey, nextState[nextKey]);
        } else {
          state[nextKey] = nextState[nextKey];
        }
      }
      return state;
    };
    var namespace = options.namespace || function () {
      return that._getAppId() || YLApp.id;
    };
    return {
      state: state,
      replace: function (nextState) {
        return applyState(nextState);
      },
      serialize: function (format) {
        return that.serialize(state, format);
      },
      deserialize: function (serialized, format) {
        var parsed = that.deserialize(serialized, format);
        return applyState(parsed);
      },
      save: function (meta, callback) {
        if (typeof meta === 'function') {
          callback = meta;
          meta = {};
        }
        that.storage.save({
          namespace: typeof namespace === 'function' ? namespace() : namespace,
          state: state,
          meta: meta || {}
        }, callback);
      },
      load: function (callback) {
        that.storage.load({
          namespace: typeof namespace === 'function' ? namespace() : namespace
        }, function (err, data) {
          if (!err && data && data.state) {
            applyState(data.state);
          }
          callback && callback(err, state, data);
        });
      }
    };
  },
  _matchTarget: function (payload) {
    if (!payload) {
      return false;
    }
    var currentAppId = this._getAppId();
    if (!payload.targetAppId && !payload.targetWindowId) {
      return true;
    }
    if (payload.targetWindowId && payload.targetWindowId === YLApp.id) {
      return true;
    }
    if (payload.targetAppId && currentAppId && payload.targetAppId === currentAppId) {
      return true;
    }
    return false;
  },
  _dispatch: function (eventName, payload, context) {
    var handlers = this._listeners[eventName] || [];
    handlers.forEach(function (handler) {
      handler(payload, context);
    });
  },
  _respond: function (targetWindowId, requestId, result, error) {
    YLApp.emit('framework:response', {
      requestId: requestId,
      result: this._normalizeObject(result),
      error: error || null,
      targetWindowId: targetWindowId,
      sourceAppId: this._getAppId(),
      sourceWindowId: YLApp.id,
      createdAt: Date.now()
    }, targetWindowId);
  },
  _handleEvent: function (msg) {
    this.init();
    if (!msg || !msg.event) {
      return;
    }
    var payload = msg.data || {};
    var context = {
      from: msg.from,
      sameOrigin: msg.sameOrigin,
      sourceAppId: payload.sourceAppId || null,
      sourceWindowId: payload.sourceWindowId || msg.from || null,
      createdAt: payload.createdAt || Date.now()
    };
    if (msg.event === 'framework:event') {
      if (!this._matchTarget(payload)) {
        return;
      }
      this._dispatch(payload.name, payload.payload, context);
      return;
    }
    if (msg.event === 'framework:request') {
      if (!this._matchTarget(payload)) {
        return;
      }
      var handler = this._requestHandlers[payload.action];
      if (!handler) {
        this._respond(payload.sourceWindowId || msg.from, payload.requestId, null, 'Handler not found: ' + payload.action);
        return;
      }
      try {
        var result = handler(payload.payload, context);
        this._respond(payload.sourceWindowId || msg.from, payload.requestId, result, null);
      } catch (e) {
        this._respond(payload.sourceWindowId || msg.from, payload.requestId, null, e.message || String(e));
      }
      return;
    }
    if (msg.event === 'framework:response') {
      if (!this._matchTarget(payload)) {
        return;
      }
      var pending = this._pendingRequests[payload.requestId];
      if (!pending) {
        return;
      }
      clearTimeout(pending.timer);
      delete this._pendingRequests[payload.requestId];
      pending.callback && pending.callback(payload.error, payload.result, context);
    }
  },
  storage: {
    _getRemoteConfig: function (callback) {
      YLApp.eval('getConfigs', null, function (configs) {
        var dataStorage = configs && configs.dataStorage || {};
        var remote = dataStorage.remote || {};
        callback({
          method: remote.method || 'POST',
          headers: remote.headers || { 'Content-Type': 'application/json' },
          timeout: remote.timeout || 30000,
          loadUrl: remote.loadUrl || '',
          saveUrl: remote.saveUrl || ''
        });
      });
    },
    _request: function (url, body, callback) {
      this._getRemoteConfig(function (config) {
        if (!url) {
          callback && callback('Missing remote url', null);
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.timeout = config.timeout;
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) {
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            var response = null;
            if (xhr.responseText) {
              try {
                response = JSON.parse(xhr.responseText);
              } catch (e) {
                response = xhr.responseText;
              }
            }
            callback && callback(null, response);
          } else {
            callback && callback('Request failed: ' + xhr.status, null);
          }
        };
        xhr.onerror = function () {
          callback && callback('Network error', null);
        };
        xhr.ontimeout = function () {
          callback && callback('Request timeout', null);
        };
        xhr.open(config.method, url);
        for (var key in config.headers) {
          xhr.setRequestHeader(key, config.headers[key]);
        }
        xhr.send(JSON.stringify(body || {}));
      });
    },
    load: function (options, callback) {
      options = options || {};
      var namespace = options.namespace || YLApp.framework._getAppId() || YLApp.id;
      this._getRemoteConfig(function (config) {
        YLApp.framework.storage._request(config.loadUrl, {
          appId: YLApp.framework._getAppId() || YLApp.id,
          namespace: namespace,
          query: options.query || {}
        }, callback);
      });
    },
    save: function (options, callback) {
      options = options || {};
      var namespace = options.namespace || YLApp.framework._getAppId() || YLApp.id;
      this._getRemoteConfig(function (config) {
        YLApp.framework.storage._request(config.saveUrl, {
          appId: YLApp.framework._getAppId() || YLApp.id,
          namespace: namespace,
          state: YLApp.framework._normalizeObject(options.state || {}),
          meta: YLApp.framework._normalizeObject(options.meta || {})
        }, callback);
      });
    }
  }
};

YLApp.serialize = function (data, format) {
  return YLApp.framework.serialize(data, format);
};
YLApp.deserialize = function (str, format) {
  return YLApp.framework.deserialize(str, format);
};
YLApp.requestApp = function (targetAppId, action, payload, callback) {
  return YLApp.framework.request(targetAppId, action, payload, callback);
};
YLApp.broadcastApp = function (eventName, payload) {
  return YLApp.framework.broadcast(eventName, payload);
};
YLApp.createStore = function (options) {
  return YLApp.framework.createStore(options);
};

var ylOnMessage = function (message) {
  var msg = message.data;
  switch (msg.type) {
    case "ylui-ping":
      if (YLApp.id) {
        parent.postMessage({
          from: [YLApp.id, YLApp.secrete],
          type: "ylui-pong",
        }, "*");
        if (YLApp._cbReady) {
          var relCbReady = YLApp._cbReady();
          YLApp._cbReady = false;
          if (relCbReady !== false)
            YLApp.emit('ready', null, true);
        }
        if (!YLApp._created) {
          YLApp.eval('getWinData', {}, function (data) {
            if (data.title === '') {
              YLApp.eval('setWinData', { title: document.title });
            }
            YLApp.framework && YLApp.framework.syncContext();
          });
          var check = function (e) {
            e = e || window.event;
            if ((e.which || e.keyCode) === 116) {
              if (e.preventDefault) {
                e.preventDefault();
                YLApp.eval('refresh', window.YLApp.id);
              } else {
                event.keyCode = 0;
                e.returnValue = false;
                YLApp.eval('refresh', window.YLApp.id);
              }
            }
          };

          if (document.addEventListener) {
            document.addEventListener("keydown", check, false);
          } else {
            document.attachEvent("onkeydown", check);
          }

          YLApp._created = true;
        }
      } else {
        YLApp.id = msg.id;
        YLApp.secrete = msg.secrete;
        YLApp.data = msg.data;
        var url = location.href;
        if (YLApp.oldHref !== url) {
          YLApp.oldHref = url;
          YLApp.eval('urlRel', url);
        }
        YLApp.framework && YLApp.framework.syncContext();
      }
      break;
    case "ylui-eval":
      var session = msg.session;
      var rel = msg.result;
      if (YLApp._cbs[session]) {
        YLApp._cbs[session](rel);
      }
      break;
    case "ylui-event":
      YLApp._dispatchEvent(msg);
      break;
  }
};

if (window.attachEvent) {
  window.attachEvent('message', ylOnMessage)
} else {
  window.addEventListener('message', ylOnMessage)
}
