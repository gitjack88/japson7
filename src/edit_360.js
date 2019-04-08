const settings = require('electron-settings');
const {ipcRenderer} = require('electron');
//设置用户名
document.getElementById('name').innerHTML = settings.get('user.name');

var section = 36;//分段文本字数（文章间隔多少个文字进行分段）
var red = 12;//飘红计数字数（至少多少个字连续出现，才算飘红）
var ending = 5;//最后一段字数（最后一段少于多少个字，不计入原创度算法）
var word_count = 600;//文章要求字数
var original = 80;//文章要求原创度
var boolNum= new Array();boolNum[0]=0;
var now_word_count = 0;//文章字数
var now_rate = 0;//原创度



//判断两个查询是否完成

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

layui.use(['form','layedit','element'], function(){
    var $ = layui.$;
    var element = layui.element;
    var layedit = layui.layedit;
    var form = layui.form;
    //初始化编辑器
    var text=layedit.build('text', {
        tool: ['strong','italic','underline','del','|','left','center','right','|','cuobiezi','clear'],
        height: 350
    });
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
        
        //显示弹层
        //mask = layer.load(1, {shade: [0.8, '#393D49']});
        document.getElementById('detection-panel').style.display="block";
        
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

        var allText=String(layedit.getText(text));
        console.log(layedit.getText(text));
        //分割文本数组
        var textArr=allText.match(reg);
        textArr.push(allText.substring(textArr.join('').length));
        //定义变量
        var redArr360 = new Array();//飘红数组360
        
        var redNumArr = new Array();//飘红次数数组
        var redArr = new Array();
        var redNull = 0;//飘红为0的条数
        var queryNum = 0;//已查询条数
        

        // function getDatares(n){
        //     console.log("n:"+n)
            
        // }
        // EachSearch360(getDatares)
        // EachSearch360(textArr,emReg,editText,allText,ChangeRed);




        EachSearchBaidu(textArr,emReg,editText,allText,redNumArr,redArr,queryNum,redNull,ChangeRed);
        // console.log("boolnum"+boolNum);
        // if(boolNum[0] == (textArr.length*2)){
        //     // createTable(textArr,redNumArr,editText,allText,rate);
        //     ChangeRed()
        // }
        return false;
    });

    // function getDatares(data){
    //     console.log("data:"+data)
        
    //    }

    //循环查询百度
    function EachSearchBaidu(textArr,emReg,editText,allText,redNumArr,redArr,queryNum,redNull,callback){
        for(var i=0;i<textArr.length;i++){
            (function(m){
         
                var CodeText=encodeURI(textArr[m]);
               
                const optionsBaidu = {
                    hostname: 'www.baidu.com',
                    port: 443,
                    path: `/baidu?wd=${CodeText}&tn=monline_4_dg&ie=utf-8`,
                    method: 'GET',
                    headers: {
                        "Connection": "keep-alive",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
                    }
                };
                //伪造请求头
                //https
                const https = require('https');
                const req = https.request(optionsBaidu, (res) => {
                    // 等待响应60秒超时
                    /* var response_timer = setTimeout(function() {
                        res.destroy();
                        console.log('Response Timeout.');
                    }, 6000); */
    
                    let code = '';
                    res.on('data', (d) => {
                        code +=d;//接收源码
                    });
                    res.on('end',()=>{
                       
                        callback && callback(code,emReg,m,editText,textArr,allText,redNumArr,redArr,queryNum,redNull)
                    })
                });
                req.on('error', (e) => {
                    console.log(e);
                });
                // console.log("ta.l1:"+textArr.length);
                boolNum[0]++;
                req.end();
            })(i)
        }
    }
    //循环查询360
    function EachSearch360(textArr,emReg,editText,allText,redNumArr,redArr,queryNum,redNull,callback){
        for(var i=0;i<textArr.length;i++){
            (function(m){
              
                var CodeText=encodeURI(textArr[m]);

                const https = require('https');
               
                const options = {
                    hostname: 'www.sogou.com',
                    port: 443,
                    
                    path: `/web?query=${CodeText}&num=20`,
                    method: 'GET',
                    headers: {
                        
                        "Cookie":"ABTEST=0|1533544732|v17; IPLOC=CN4301; SUV=0093178B249E224C5B68091D465D3713; browerV=3; osV=1; CXID=3A763A43B966D89509E82529E15EBEF6; SUID=A0BAF6715B68860A5AC96D90000BA6D4; pgv_pvi=2778237952; wuid=AAFzUj/YIQAAAAqGGWzArAQAGwY=; SNUID=A4C576CCE8ED9B8714665C44E856BEBC; taspeed=taspeedexist; pgv_si=s8608677888; ad=IYibokllll2bz5RKlllllVHh$kZlllllJJcAFlllllwlllllRXDll5@@@@@@@@@@; sct=10; sst0=5; ld=Nkllllllll2bzl6NlllllVHh$EklllllJJcAFllllxYlllllRklll5@@@@@@@@@@",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
                        
                    }
                };
                //https
                const req = https.request(options, (res) => {
                    
                    let code = '';
                    res.on('data', (d) => {
                        code +=d;

                    });
                    res.on('end',()=>{
                        // console.log('funtextArr[m]:'+textArr[m]);
                        // console.log('funtextArr:'+textArr);
                        callback && callback(code,emReg,m,editText,textArr,allText,redNumArr,redArr,queryNum,redNull)
                        
                    })
                });
                req.on('error', (e) => {
                    console.log(e);
                });
                // console.log("ta.l2:"+textArr.length);
                boolNum[0]++;
                req.end();
            })(i)
        } 
    } 

    

    //记录飘红
    function ChangeRed(code,emReg,subscript,editText,textArr,allText,redNumArr,redArr,queryNum,redNull){

        // console.log("textArr:"+textArr)
        // console.log(boolNum);
        
        let emArr= String(code).match(emReg);
       
        redNumArr[subscript]=0;
        redArr[subscript] = '';
        
        let emArrLen = 0;
        if(null != emArr && emArr.hasOwnProperty('length')){
            emArrLen = emArr.length;
        }
        //分割搜索
        
        for(var j=0;j<emArrLen;j++){
            let num=emArr[j].length;
            //console.log(emArr[j],num-9);
            if (num>(red+9)) {
                redNumArr[subscript]++;

                redArr[subscript] += emArr[j].substring(4,num-5) + '<br/>';
            }
            
            
        }
        //console.log('m'+":"+m +":"+ textArr[m]+"redNumArr["+m+"]"+":"+redNumArr[m]);
        
        //if(m==1 || m==2){console.log(emArr);}
        //如果飘红为0则累计条数


        if(redNumArr[subscript]==0){
            //先判断是不是最后一句
           
            if(subscript == (textArr.length-1)){
                //是最后一句的时候，判断有没有达到字数
                if(textArr[subscript].length >= ending){
                    //达到则累计
                    redNull++;
                }
            }else{
                redNull++;
            }
        }else{
            if(subscript != (textArr.length-1)){
                //渲染飘红
                //let emTxt = emArr[j].substring(4,num-5);console.log(emTxt);
                editText = editText.replace(textArr[subscript],'<span onmouseover="parent.redText(\''+redArr[subscript]+'\')" style="border-bottom-color:#FF0000; border-bottom-style:dashed; border-bottom-width:1px;">'+textArr[subscript]+'</span>');
                //console.log(editText);
                //layedit.setContent(text,editText);
                document.getElementById('LAY_layedit_1').contentWindow.document.getElementsByTagName("body")[0].innerHTML = editText;
            }
        }

        //累计查询次数
        queryNum++;
        //动态修改进度
        
        speed = (300 - (300 / textArr.length * queryNum))/2;console.log(speed);
        document.getElementById('speed').setAttribute("style","stroke-dasharray: 298.493, 298.493; stroke-dashoffset:"+speed);

        //如果查询次数大于等于文本段数（已查询完成）
        if(queryNum>=textArr.length){
            var rate = 0;//原创度百分比
            console.log("rate:"+rate)
            //计算原创度（飘红为0的条数除以总条数）
            rate = Math.floor(redNull/textArr.length*10000) / 100;
            console.log("rate2:"+rate)
            //console.log('queryNum:'+queryNum+" rate:"+rate,textArr.length);
            //显示原创度
            document.getElementById('info').setAttribute("class","detection-over");
            document.getElementById('info').innerHTML = '<span class="score">'+ rate +'%</span><br><span class="tag">原创度</span>';
            createTable(textArr,redNumArr,allText);
            
            
            //显示表格
            document.getElementById('table').style.display="block";
            
            document.getElementById('msg').innerHTML = '要求字数：'+word_count+' 当前字数：'+allText.length+'  要求原创度：'+original+ ' 当前原创度：'+rate;
            
            now_word_count = allText.length;
            now_rate = rate;

            //判断字数是否达标
            if(allText.length < word_count || rate < original){
                document.getElementById('go').innerHTML = '字数或者原创度还没达到标准哦！';
            }else{
                document.getElementById('go').innerHTML = '<button class="layui-btn" lay-submit lay-filter="put">立即提交</button>';
            }
        }
        
    }


    //创建表格
    function createTable(textArr,redNumArr,allText){
        //计算原创度（飘红为0的条数除以总条数）

        rate = Math.floor(redNull/textArr.length*10000) / 100;
        //循环创建表格
        for(var k=0;k<textArr.length;k++){
            //创建行
            var tr=document.createElement("tr");
            //创建第一个单元格
            var td = document.createElement("td");
            var tdContent = document.createTextNode(k+1);
            td.appendChild(tdContent);
            //tr中添加该单元格
            tr.appendChild(td);

            //创建第二个单元格
            var td = document.createElement("td");
            //创建input
            var input = document.createElement("input");
            input.setAttribute("style","width:100%;border: none;outline: none;");
            input.value = textArr[k];
            td.appendChild(input);
            //tr中添加该单元格
            tr.appendChild(td);

            //创建第三个单元格
            var td = document.createElement("td");
            //创建a标签
            var a = document.createElement("a");
            a.setAttribute("href","javascript:void(0);");
        
            a.setAttribute("onclick","send('https://www.sogou.com/web?query="+encodeURI(textArr[k])+"&num=20')");
            a.innerHTML = redNumArr[k];
            //var tdContent = document.createTextNode(redNumArr[k]);
            td.appendChild(a);
            //tr中添加该单元格
            tr.appendChild(td);
            document.getElementById('tbody').appendChild(tr);
        }
        //显示表格
        document.getElementById('table').style.display="block";
        
        document.getElementById('msg').innerHTML = '要求字数：'+word_count+' 当前字数：'+allText.length+'  要求原创度：'+original+ ' 当前原创度：'+rate;
        
        now_word_count = allText.length;
        now_rate = rate;
    }

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