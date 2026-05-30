# 跨 APP 磁贴状态同步模块

## 功能概述

本模块为 YLUI 框架提供了跨 APP 磁贴状态同步功能，主要包括：

1. **实时同步**：主 APP 修改磁贴排序/显隐后，通过 ylui 跨域事件总线广播给其他 APP
2. **本地存储**：所有配置数据用 Vue 的响应式机制保存到 localStorage
3. **自动恢复**：刷新页面后自动从 localStorage 恢复磁贴配置
4. **零依赖**：禁止使用 axios、fetch 等外部通信库，完全利用 ylui 原生机制

## 核心组件

### 1. YL.TileSync 对象

主要功能方法：

| 方法 | 说明 |
|------|------|
| `YL.TileSync.init()` | 初始化同步模块 |
| `YL.TileSync.getTilesData()` | 获取当前磁贴数据 |
| `YL.TileSync.saveToStorage()` | 保存磁贴数据到 localStorage |
| `YL.TileSync.loadFromStorage()` | 从 localStorage 加载数据 |
| `YL.TileSync.applyTilesData(data)` | 应用磁贴数据到视图 |
| `YL.TileSync.broadcastTilesUpdate()` | 广播磁贴更新事件 |

### 2. YLApp 扩展方法

供子应用使用的便捷 API：

| 方法 | 说明 |
|------|------|
| `YLApp.getTiles(callback)` | 获取最新磁贴数据 |
| `YLApp.onTilesUpdate(callback)` | 监听磁贴更新事件 |
| `YLApp.requestTilesSync()` | 请求同步 |

## 使用示例

### 子应用集成方式

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 引入 yl.app.js -->
    <script src="path/to/yl.app.js"></script>
</head>
<body>
    <script>
        // 等待 YLApp 就绪
        YLApp.onReady(function () {
            console.log('YLApp 已就绪，ID:', YLApp.id);
            
            // 监听磁贴更新
            YLApp.onTilesUpdate(function (data) {
                console.log('收到磁贴更新:', data);
                // 处理磁贴数据...
            });
        });
        
        // 或者直接通过 YLApp.onEvent 监听
        YLApp.onEvent(function (msg) {
            if (msg.event === 'tilesUpdated') {
                // 处理更新
            }
        });
        
        // 获取当前磁贴数据
        function loadCurrentTiles() {
            YLApp.getTiles(function (data) {
                console.log('当前磁贴数据:', data);
            });
        }
    </script>
</body>
</html>
```

### 数据格式

localStorage 中保存的数据格式：

```javascript
{
  "timestamp": 1234567890123,  // 时间戳
  "tiles": [                   // 磁贴分组数据
    {
      "title": "分组名",
      "data": [
        {
          "x": 0,
          "y": 0,
          "w": 2,
          "h": 2,
          "app": "app-id",
          "title": "磁贴标题",
          "i": "unique-id",
          "params": {},
          "hash": ""
        }
      ]
    }
  ]
}
```

## 实现原理

### 主应用流程

1. **初始化阶段**：
   - Vue 实例创建后自动初始化 TileSync 模块
   - 检查 localStorage 中是否有保存的配置
   - 如果有，自动应用到当前视图

2. **磁贴变更**：
   - Vue 的 watcher 监听 tiles 数据的变化
   - 变化发生时自动调用 `YL.TileSync.broadcastTilesUpdate()`
   - 通过 ylui 的事件总线向所有 APP 广播 `tilesUpdated` 事件
   - 同时保存新配置到 localStorage

3. **刷新恢复**：
   - 页面刷新时，从 localStorage 读取保存的配置
   - 使用 Vue 的响应式机制更新数据

### 子应用流程

1. **初始化**：
   - 子 APP 通过 `YLApp.onReady()` 等待就绪
   - 使用 `YLApp.onTilesUpdate()` 注册回调

2. **同步接收**：
   - 主 APP 广播事件，ylui 自动转发给所有子 APP
   - 子 APP 接收事件后更新自己的视图

## 文件结构

```
ylui/
├── res/
│   ├── js/
│   │   ├── yl-tile-sync.js   # 新添加的同步模块
│   │   ├── yl-render.js      # 修改：添加 watch 和初始化
│   │   └── yl-io.js          # 修改：加载新模块
│   └── yl.app.js             # 修改：子 APP 事件处理
└── res/apps/tile-sync-demo/  # 示例应用
    └── index.html
```

## 开发注意事项

1. **兼容性**：模块完全兼容 ylui 现有架构
2. **性能**：使用 Vue 的 deep watch，注意修改频率
3. **安全**：所有数据存储在 localStorage，注意容量限制
4. **跨域**：完全利用 ylui 的 postMessage 机制，无额外网络请求

## 测试方式

1. 启动 ylui 项目
2. 打开示例应用：`res/apps/tile-sync-demo/index.html`
3. 修改磁贴（排序、调整大小、删除等）
4. 观察示例应用的日志输出
5. 刷新页面验证是否恢复配置

## 内部实现细节

### 数据监听机制

使用 Vue 的 watch 深度监听：

```javascript
watch: {
  tiles: {
    handler: function(val) {
      YL.TileSync.broadcastTilesUpdate();
    },
    deep: true
  }
}
```

### 事件广播机制

使用 ylui 原生事件：

```javascript
YL.vue.emitWinEvent(0, 'tilesUpdated', {
  tiles: data,
  timestamp: Date.now()
});
```
