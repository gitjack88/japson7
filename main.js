const {app, BrowserWindow, Menu, globalShortcut, ipcMain, shell} = require('electron');
const settings = require('electron-settings');
//const feedUrl = `http://127.0.0.1/update/`;  更新包位置2
const feedUrl = `http://tmzmt.api.gd/lj/`; // 更新包位置
const { autoUpdater } = require('electron-updater');
const http =require('http');
var package = require("./package.json");
let webContents;
let win;
var selfversion = package.version;
// console.log(selfversion)
	

  	function createWindow () {
	    // 创建浏览器窗口
	    win = new BrowserWindow({width: 600, height: 400, show: false});
	    webContents = win.webContents;
	    win.once('ready-to-show', () => {
	    	win.show();
        });

        win.on('resize', () => {
	    	console.log(win.getSize(),win.getContentSize());
		});

		// function banbenhao (){
		// 	var version = '';
	
		// 	return new Promise(function(resolve, reject){
		// 		http.get('http://127.0.0.1/update/update.txt',function(res){
		// 			res.setEncoding('utf8');
		// 			let rawData = '';
		// 			res.on('data', (chunk) => version += chunk);
		// 			res.on('end', () => {
		// 				resolve(version);
		// 			});
		// 		})
		// 	})
			
			
		// }
		// async function test () {
		// 	let re = await banbenhao();
		// 	console.log(String(re));
		// 	if(re!==selfversion){
		// 		console.log(1);
		// 		//打开更新窗口
		// 		win.loadURL(`file://${__dirname}/autoupdate.html`);
		// 	}else{
		// 		//判断登录
		// 		if(settings.get('user.token')){console.log(settings.get('user.token'));
		// 		//设置打开尺寸
		// 		win.setSize(1008, 732);
		// 		//将窗口移动到屏幕中央
		// 		win.center();
		// 		//打开主窗口
		// 		win.loadURL(`file://${__dirname}/index.html`);
		// 		}else{
		// 			//打开登录窗口
		// 			win.loadURL(`file://${__dirname}/login.html`);	
		// 		}
		// 	 }
		// }
		
		// test();
		
		function getVersion (){
			http.get('http://127.0.0.1/update/latest.yml',function(res){
					res.setEncoding('utf8');
					var rawData = '';
					res.on('data', (chunk) => rawData += chunk);
					res.on('end', () => {
						if(rawData.slice(8,15)!==selfversion){
							//打开更新窗口
							win.loadURL(`file://${__dirname}/autoupdate.html`);
						}else{
							OpenUrl();
							}
					});
				})
		}
		function OpenUrl(){
			//判断登录
			if(settings.get('user.token')){
				// console.log(settings.get('user.token'));
			//设置打开尺寸
			win.setSize(1008, 732);
			//将窗口移动到屏幕中央
			win.center();
			//打开主窗口
			
			win.loadURL(`file://${__dirname}/index.html`);
			}else{
				//打开登录窗口
				win.loadURL(`file://${__dirname}/login.html`);	
			}
		}
		getVersion();
			
	     //监听登录
		 ipcMain.on('exit-update', function(event, msg) {
			 setTimeout(function(){
				OpenUrl();
				
			 },2500)
            
		});
		
		
		
	    //监听登录
    	ipcMain.on('login-msg', function(event, msg) {
            //设置打开尺寸
            win.setSize(1008, 732);
            //将窗口移动到屏幕中央
            win.center();
			//打开主窗口
            win.loadURL(`file://${__dirname}/index.html`);
		});

	    //监听退出操作
    	ipcMain.on('login-out', function(event, act) {
            settings.delete('user.token');
            //打开主窗口
            win.loadURL(`file://${__dirname}/login.html`);
            //设置打开尺寸
            win.setSize(600, 400);
		});

	    //监听打开url
    	ipcMain.on('loadurl-message', function(event, url) {
            shell.openExternal(url);
		});

		//注册热键
	    globalShortcut.register('CommandOrControl+Alt+T', function() {
			win.webContents.isDevToolsOpened() ? win.webContents.closeDevTools() : win.webContents.openDevTools();
		});
		
		globalShortcut.register('CommandOrControl+Alt+M', function() {
			settings.delete('user.token');
			//打开主窗口
            win.loadURL(`file://${__dirname}/login.html`);
            //设置打开尺寸
            win.setSize(600, 400);
		});
	    
		
	    //菜单栏
	    if (process.platform === 'darwin') {
	    	//MAC os 
		  	const name = app.getName()
		  	let template = [{
		    	label: name,
		    	submenu: [{
		      		label: `关于 ${name}`,
		      		role: 'about'
		    	}, {
		      		type: 'separator'
		    	}, {
		      		label: '退出',
		      		accelerator: 'Command+Q',
		      		click: function () {
		        		app.quit()
		      		}
		    	}]
		  	}];
		  	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
		}else{
			//移除菜单栏
			Menu.setApplicationMenu(null);
		}

		// 当 window 被关闭，这个事件会被触发。
		win.on('closed', () => {
		  // 取消引用 window 对象，如果你的应用支持多窗口的话，
		  // 通常会把多个 window 对象存放在一个数组里面，
		  // 与此同时，你应该删除相应的元素。
		  win = null
		})
	  	
    
	}

	ipcMain.on('Updates',(e,arg)=>{
		//执行自动更新检查
		autoUpdater.checkForUpdates();
	});
	
	let j = win;
	//let g = ipcMain;
	autoUpdater.setFeedURL(feedUrl);
	autoUpdater.on('checking-for-update', function () {
		webContents.send('updatestatus', {
			status: 1,
			percent: 0,
			msg: '正在检查更新...'
		})
	}), 

	autoUpdater.on('update-available', function (data) {
		webContents.send('updatestatus', {
			status: 1,
			percent: 25,
			msg: '检测到新版本，正在下载……'
		})
	}), 
	autoUpdater.on('update-not-available', function () {
		webContents.send('updatestatus', {
			status: 0,
			percent: 100,
			msg: '现在使用的就是最新版本，不用更新!',
			quit:"200"
		})
	}), 
	autoUpdater.on('download-progress', function (data) {
		//检测更新进度条
		// console.log('data.percent:'+data.percent);
		var mse = '正在下载软件更新，下载速度为：';
		mse += data.bytesPerSecond && 0 < data.bytesPerSecond ? data.bytesPerSecond / 1e3 + 'Kb/s' : '0Kb/s', webContents.send('updatestatus', {
			status: 1,
			percent: +(25 + 75 * (data.percent / 100)).toFixed(2),
			msg: mse
		})
	}), 
	autoUpdater.on('error', function () {
		console.log("error")
		webContents.send('updatestatus', {
			status: 0,
			percent: 100,
			msg: '检查更新出错',
			info: l
		})
	}), 
	autoUpdater.on('update-downloaded', function () {
		webContents.send('updatestatus', {
			status: 0,
			percent: 100,
			msg: '\u4E0B\u8F7D\u5B8C\u6210\uFF0C\u5C06\u542F\u52A8\u81EA\u52A8\u5B89\u88C5'
		}), 
		autoUpdater.quitAndInstall()
	})

  
    app.on('ready', createWindow);
 
    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
  
    // 当全部窗口关闭时退出。
    app.on('window-all-closed', () => {
        // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
        // 否则绝大部分应用及其菜单栏会保持激活。
        if (process.platform !== 'darwin') {
        app.quit()
        }
    })