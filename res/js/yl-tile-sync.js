(function () {
  var STORAGE_KEY = 'ylui-tile-sync-data';
  var TILES_UPDATED_EVENT = 'tilesUpdated';

  YL.TileSync = {
    _initialized: false,
    _lastBroadcast: 0,
    _throttleInterval: 500,
    _applying: false,
    init: function () {
      if (this._initialized) return;
      this._initialized = true;
      var stored = this.loadFromStorage();
      if (!stored || !stored.tiles) {
        this.saveToStorage(this.createPayload());
      }
      YL.debug('TileSync module initialized');
    },
    createPayload: function (timestamp) {
      var tiles = [];
      if (YL.util && YL.util.dataCopy) {
        tiles = YL.util.dataCopy('tiles') || [];
      } else if (YL.vue && YL.vue.tiles) {
        tiles = YL.vue.tiles;
      }
      return {
        timestamp: timestamp || Date.now(),
        tiles: Yuri2.jsonDeepCopy(tiles)
      };
    },
    getTilesData: function () {
      return this.createPayload().tiles;
    },
    saveToStorage: function (payload) {
      try {
        var data = payload || this.createPayload();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        YL.debug('Tiles data saved to localStorage');
        return data;
      } catch (e) {
        YL.debug('Failed to save tiles data: ' + e);
        return null;
      }
    },
    loadFromStorage: function () {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        var data = JSON.parse(stored);
        if (!data || !Yuri2.isArray(data.tiles)) return null;
        return {
          timestamp: data.timestamp || 0,
          tiles: Yuri2.jsonDeepCopy(data.tiles)
        };
      } catch (e) {
        YL.debug('Failed to load tiles data: ' + e);
        return null;
      }
    },
    applyTilesData: function (tilesData) {
      if (!YL.vue || !Yuri2.isArray(tilesData)) return false;
      var that = this;
      try {
        that._applying = true;
        var nextTiles = Yuri2.jsonDeepCopy(tilesData);
        YL.vue.$set(YL.vue, 'tiles', nextTiles);
        YL.vue.$forceUpdate();
        that.saveToStorage({
          timestamp: Date.now(),
          tiles: Yuri2.jsonDeepCopy(nextTiles)
        });
        if (YL.vue.$nextTick) {
          YL.vue.$nextTick(function () {
            if (YL.util && YL.util.artificiallyResize) {
              YL.util.artificiallyResize();
            }
            that._applying = false;
          });
        } else {
          that._applying = false;
        }
        YL.debug('Tiles data applied to view');
        return true;
      } catch (e) {
        that._applying = false;
        YL.debug('Failed to apply tiles data: ' + e);
        return false;
      }
    },
    broadcastTilesUpdate: function (force) {
      if (!YL.vue || !YL.vue.emitWinEvent || this._applying) return null;
      var now = Date.now();
      if (!force && now - this._lastBroadcast < this._throttleInterval) {
        YL.debug('Broadcast throttled, skipping');
        return null;
      }
      this._lastBroadcast = now;
      try {
        var payload = this.createPayload(now);
        this.saveToStorage(payload);
        YL.vue.emitWinEvent(0, TILES_UPDATED_EVENT, payload);
        YL.debug('Tiles update broadcasted to all apps');
        return payload;
      } catch (e) {
        YL.debug('Failed to broadcast tiles update: ' + e);
        return null;
      }
    },
    onTilesUpdate: function (callback) {
      if (typeof callback !== 'function' || !window.YLApp || !window.YLApp.onTilesUpdate) return;
      window.YLApp.onTilesUpdate(callback);
    },
    getLatestTiles: function (callback) {
      var localData = this.loadFromStorage();
      if (!localData) {
        localData = this.createPayload();
        this.saveToStorage(localData);
      }
      if (callback) callback(localData);
      return localData;
    },
    requestSync: function () {
      return this.broadcastTilesUpdate(true);
    },
    clearStorage: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
        YL.debug('Tiles storage cleared');
        return true;
      } catch (e) {
        YL.debug('Failed to clear tiles storage: ' + e);
        return false;
      }
    },
    getStorageInfo: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var stored = this.loadFromStorage();
        if (!stored) {
          return { exists: false };
        }
        return {
          exists: true,
          timestamp: stored.timestamp,
          tileCount: stored.tiles.length,
          size: raw ? raw.length : 0
        };
      } catch (e) {
        return { exists: false, error: e };
      }
    }
  };
})();