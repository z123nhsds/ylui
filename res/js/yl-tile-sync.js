/**
 * YLUI 跨 APP 磁贴状态同步模块
 * 基于现有 ylui 事件总线实现
 */

(function() {
  // 存储键名
  const STORAGE_KEY = 'ylui-tile-sync-data';
  // 事件名称
  const TILES_UPDATED_EVENT = 'tilesUpdated';

  // 同步模块实例
  YL.TileSync = {
    _initialized: false,
    _lastBroadcast: 0,
    _throttleInterval: 500, // 500ms 防抖动

    /**
     * 初始化同步模块
     */
    init: function() {
      if (this._initialized) return;
      this._initialized = true;
      YL.debug('TileSync module initialized');
    },

    /**
     * 获取当前磁贴数据（深拷贝）
     */
    getTilesData: function() {
      if (!YL.vue || !YL.vue.tiles) return [];
      // 使用 Yuri2 的深拷贝方法
      return Yuri2.jsonDeepCopy(YL.vue.tiles);
    },

    /**
     * 保存磁贴数据到 localStorage
     */
    saveToStorage: function() {
      try {
        const data = this.getTilesData();
        const serialized = JSON.stringify({
          timestamp: Date.now(),
          tiles: data
        });
        localStorage.setItem(STORAGE_KEY, serialized);
        YL.debug('Tiles data saved to localStorage');
        return true;
      } catch (e) {
        YL.debug('Failed to save tiles data: ' + e);
        return false;
      }
    },

    /**
     * 从 localStorage 加载磁贴数据
     */
    loadFromStorage: function() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        const data = JSON.parse(stored);
        YL.debug('Tiles data loaded from localStorage');
        return data;
      } catch (e) {
        YL.debug('Failed to load tiles data: ' + e);
        return null;
      }
    },

    /**
     * 应用磁贴数据到当前视图
     */
    applyTilesData: function(tilesData) {
      if (!YL.vue || !tilesData) return false;
      try {
        // 使用 Vue 的响应式机制更新数据
        YL.vue.tiles = Yuri2.jsonDeepCopy(tilesData);
        // 强制触发更新
        YL.vue.$forceUpdate();
        YL.debug('Tiles data applied to view');
        return true;
      } catch (e) {
        YL.debug('Failed to apply tiles data: ' + e);
        return false;
      }
    },

    /**
     * 广播磁贴更新事件给所有 APP（带防抖动）
     */
    broadcastTilesUpdate: function() {
      if (!YL.vue || !YL.vue.emitWinEvent) return;
      
      // 防抖动
      var now = Date.now();
      if (now - this._lastBroadcast < this._throttleInterval) {
        YL.debug('Broadcast throttled, skipping');
        return;
      }
      this._lastBroadcast = now;
      
      try {
        const tilesData = this.getTilesData();
        // 通过 ylui 事件总线广播
        YL.vue.emitWinEvent(0, TILES_UPDATED_EVENT, {
          tiles: tilesData,
          timestamp: now
        });
        // 同时保存到 localStorage
        this.saveToStorage();
        YL.debug('Tiles update broadcasted to all apps');
      } catch (e) {
        YL.debug('Failed to broadcast tiles update: ' + e);
      }
    },

    /**
     * 监听磁贴更新事件（供 APP 调用）
     */
    onTilesUpdate: function(callback) {
      if (typeof callback !== 'function') return;
      
      // 通过 YLApp 监听事件
      if (window.YLApp) {
        window.YLApp.onEvent(function(msg) {
          if (msg.event === TILES_UPDATED_EVENT) {
            callback(msg.data);
          }
        });
      }
    },

    /**
     * 子 APP 调用：获取最新的磁贴数据
     */
    getLatestTiles: function(callback) {
      // 优先从 localStorage 读取
      const localData = this.loadFromStorage();
      if (localData) {
        if (callback) callback(localData);
        return;
      }
      
      if (callback) callback(null);
    },

    /**
     * 子 APP 调用：请求同步磁贴数据
     */
    requestSync: function() {
      this.broadcastTilesUpdate();
    },

    /**
     * 清除本地存储的磁贴数据
     */
    clearStorage: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        YL.debug('Tiles storage cleared');
        return true;
      } catch (e) {
        YL.debug('Failed to clear tiles storage: ' + e);
        return false;
      }
    },

    /**
     * 获取存储信息
     */
    getStorageInfo: function() {
      try {
        var stored = this.loadFromStorage();
        if (!stored) {
          return { exists: false };
        }
        var size = new Blob([localStorage.getItem(STORAGE_KEY)]).size;
        return {
          exists: true,
          timestamp: stored.timestamp,
          tileCount: stored.tiles.length,
          size: size
        };
      } catch (e) {
        return { exists: false, error: e };
      }
    }
  };

})();
