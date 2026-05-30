/**
 * 读取配置示例文件
 * 修改此文件来实现持久化
 * YL.init(data) 中的data必须是ylui接受的数据格式
 * 开发者可以自行决定从静态文件读取（如basic.json）还是从远程服务器拉取（如ajax请求）
 */

YL.onLoad(function () {
  // 读取url中load参数，如localhost/ylui/index.html?load=basic
  var load = Yuri2.parseURL().params.load;
  var file;
  
  // 先检查数据存储模式
  var storageMode = YL.static.dataStorage && YL.static.dataStorage.mode || 'localStorage';
  
  if (storageMode === 'remote' || storageMode === 'hybrid') {
    // 远程模式或混合模式：优先尝试从远程加载
    YL.loadRemoteData(function(err, data) {
      if (!err && data) {
        // 远程加载成功
        YL.init(data);
        
        // 混合模式下同时保存到本地
        if (storageMode === 'hybrid' && YL.dataSync) {
          YL.dataSync.saveToLocal(data);
        }
        
        // 初始化数据存储系统
        YL.initDataStorage && YL.initDataStorage();
      } else {
        // 远程加载失败，回退到本地模式
        YL.debug('远程加载失败，使用本地数据');
        loadLocalData();
      }
    });
  } else {
    // 本地存储模式
    loadLocalData();
  }
  
  function loadLocalData() {
    // 当load === 'ylui-storage'时，尝试加载浏览器缓存
    if (load === YL.static.localStorageName && localStorage.getItem(YL.static.localStorageName)) {
      YL.init();
      YL.initDataStorage && YL.initDataStorage();
      return;
    } else if (load === YL.static.localStorageName) {
      file = 'basic';
    }
    
    // 从json文件读取
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
