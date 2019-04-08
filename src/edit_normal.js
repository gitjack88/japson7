const settings = require('electron-settings');
const {ipcRenderer} = require('electron');
const public = require('./public');
//设置用户名
document.getElementById('name').innerHTML = settings.get('user.name');

var section = 36;//分段文本字数（文章间隔多少个文字进行分段）
var red = 12;//飘红计数字数（至少多少个字连续出现，才算飘红）
var ending = 5;//最后一段字数（最后一段少于多少个字，不计入原创度算法）
var word_count = 600;//文章要求字数
var original = 80;//文章要求原创度
var timer = null;
var now_word_count = 0;//文章字数
var now_rate = 0;//原创度

//请求数据
window.onload =function() {
	var token = settings.get('user.token');
	var xhr = new XMLHttpRequest();
	xhr.open('GET','http://fawen.api.gd/api/v1/config?token='+token,true);
	xhr.onreadystatechange = function(event){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				var data = JSON.parse(xhr.response);
				console.log(data.msg);
				
				if(data.code == 1){
					section = data.section;
					red = data.red;
					ending = data.ending;
					word_count = data.word_count;
					original = data.original;
				}else{
					layui.use('layer', function(){
						layer.msg(data.msg);
					});
					ipcRenderer.send('login-out', 'ok');
				}
			}
		}
	};
	xhr.send(null);
};

//监听点击
function send (url) {
    ipcRenderer.send('loadurl-message', url);
}

//飘红提示
function redText(text) {
    layui.use('layer',function(){
        layer.tips('<p style="color:#FF5722">飘红句子：</p>'+text, '#LAY_layedit_1');
    });
}

//错误提示
function errorText(text) {
    layui.use('layer',function(){
        layer.tips('<p style="color:#FFB800">错误检查：</p>'+text, '#LAY_layedit_1');
    });
}



layui.use(['form','layedit','element','upload'], function(){
    var $ = layui.$;
    var element = layui.element;
    var layedit = layui.layedit;
    var form = layui.form;
    var upload = layui.upload;
    var uploadInst = upload.render({
        elem: '#uploadfiles' //绑定元素
        ,url: '/upload/' //上传接口
        ,done: function(res){
        //上传完毕回调
        }
        ,error: function(){
        //请求异常回调
        }
    });
    //初始化编辑器
    var text=layedit.build('text', {
        tool: ['strong','italic','underline','del','|','left','center','right','|','cuobiezi','clear'],
        height: 350
    });
    var ifr = document.getElementById('LAY_layedit_1').contentWindow.document.getElementsByTagName('body')[0];
    var storage=window.localStorage;
    var key = storage.key(0);
    var c=storage.getItem(key);
    if(layedit.getText(text)=='' && c!=""){
        ifr.innerHTML=c;
    }
    // timer =setInterval(function(){
    //     var getContentLayedit=layedit.getContent(text);
    //     console.log();
    //     public.autoSave(getContentLayedit);
        
    // },1000)
    //监听退出
	element.on('nav(user)', function(data){
		if(this.getAttribute("data") == "login-out"){
			ipcRenderer.send('login-out', 'out');
		}
    });
    
    
    //document.getElementById('LAY_layedit_1').contentWindow.document.getElementsByTagName("body")[0].setAttribute("onpaste","return false");
	//document.getElementById('LAY_layedit_1').contentWindow.document.getElementsByTagName("body")[0].setAttribute("oncopy","return false");

    //监听检测
    form.on('submit(submit)', function(data){

        //判断字数是否足够最低分段数
        if(layedit.getText(text).length <= section){
            layer.msg('字数太少啦！');
            return false;
        }
       
        //清除自动保存的定时器
        clearInterval(timer);
        localStorage.setItem("articleValue",'');
        //显示弹层
        //mask = layer.load(1, {shade: [0.8, '#393D49']});
        document.getElementById('detection-panel').style.display="block";
        var allText=String(layedit.getText(text));
        //监听关闭
        document.getElementById('close').onclick=function(){
            //关闭弹层和遮罩
            //layer.close(mask);
            document.getElementById('detection-panel').style.display="none";
            //重置内容
            document.getElementById('speed').setAttribute("style","stroke-dasharray: 298.493, 298.493; stroke-dashoffset:298.493");
            document.getElementById('info').setAttribute("class","detection-btn");
            document.getElementById('info').innerHTML = '正在检测';
            document.getElementById('tbody').innerHTML = '';
            document.getElementById('table').style.display="none";
            document.getElementById('msg').innerHTML = '';
            document.getElementById('go').innerHTML = '';
        }

        //文章分段正则表达式
        var reg = new RegExp(".{"+section+"}","g"); 
        //匹配em元素表达式
		var emReg= /<em>(.*?)<\/em>/g;
        //获取全部文本
        var editText = layedit.getContent(text);

        //清除错别字标红格式
        var find = '<span.*?">';
        var re = new RegExp(find, 'g');
        editText = editText.replace(re, '');
        find = '</span>';
        re = new RegExp(find, 'g');
        editText = editText.replace(re, '');
		find = '<strong>';
		re = new RegExp(find, 'g');
		editText = editText.replace(re, '');
        find = '</strong>';
		re = new RegExp(find, 'g');
        editText = editText.replace(re, '');

        
        // console.log(layedit.getText(text));
        //分割文本数组
        var textArr=allText.match(reg);
        textArr.push(allText.substring(textArr.join('').length));
        //创建变量
        var redNumArr = new Array();//飘红次数数组
        
        //循环查询
        public.CyclicQueryBaiDu(textArr,emReg,editText,allText,public.getDatares);
        
        return false;
    });

    //监听提交
    form.on('submit(put)', function(data){
        var title=document.getElementById('title').value;
        var link=document.getElementById('link').value;
        //提交数据
        const http = require('http');
        const querystring = require('querystring');
        const postData = querystring.stringify({
            'token' : settings.get('user.token'),
            'title' : title,
            'link' : link,
            'text' : layedit.getContent(text),
            'rate' : now_rate,
            'word_count' : now_word_count
        });

        const options = {
            hostname: 'fawen.api.gd',
            port: 80,
            path: '/api/v1/upload',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            let data = '';
            res.on('data', (chunk) => {
                data +=chunk;
            });
            res.on('end', () => {
                console.log('响应中已无数据。');
                data = JSON.parse(data);
                console.log(data.msg);
                layer.msg(data.msg, {icon: 1});
				if(data.code == 1){
					setTimeout(function() {window.location.href="edit.html";},"1500");
				}
            });
        });

        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
        });

        // 写入数据到请求主体
        req.write(postData);
        req.end();
    });

});