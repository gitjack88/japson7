// var edit_nor = require('./edit_normal.js');
var op360redArr=new Array();
var redArr = new Array();//飘红数组

function createTable(textArr,redNumArr){
    //循环创建表格
    for(var k=0;k<textArr.length;k++){
        //创建行
        var tr=document.createElement("tr");
        tr.setAttribute('id',"tr");
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
        var a1 = document.createElement("a");
        a1.setAttribute("href","javascript:void(0);");
    
        a1.setAttribute("onclick","send('https://www.baidu.com/s?wd="+encodeURI(textArr[k])+"&tn=monline_4_dg&ie=utf-8')");
        a1.innerHTML = redNumArr[k];
        //var tdContent = document.createTextNode(redNumArr[k]);
        td.appendChild(a1);
        //tr中添加该单元格
        tr.appendChild(td);
        //创建第四个单元格
        var td = document.createElement("td");
        //创建a标签
        var a2 = document.createElement("a");
        a2.setAttribute("href","javascript:void(0);");
        console.log(op360redArr);
        a2.setAttribute("onclick","send('https://www.so.com/s?ie=utf-8&fr=hao_360so&src=home_hao_360so&q=="+encodeURI(textArr[k])+"')");
        a2.innerHTML = op360redArr[k];
        
        //var tdContent = document.createTextNode(redNumArr[k]);
        td.appendChild(a2);
        //tr中添加该单元格
        tr.appendChild(td);
        document.getElementById('tbody').appendChild(tr);
       
    }
}

    

    function get360(textArr,emReg,editText,allText,callback){
        for(var i=0;i<textArr.length;i++){
            var op = (function (n){
                  var CodeText=encodeURI(textArr[n]);
                  // console.log(CodeText);
                  const options360 = {
                    hostname: 'www.so.com',
                    port: 443,
                    path: `/s?ie=utf-8&fr=hao_360so&src=home_hao_360so&q==${CodeText}`,
                    method: 'GET',
                    headers: {
                        "Cookie": "PHPSESSID=rlvglk3776d3rselfrvif0nbk0",
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
                        }
                    } 
                  const https = require('https');
                  const req = https.request(options360, (res) => {
                     
                      let chunk = "";
                      res.on('data', (d) => {
                          chunk +=d;//接收源码
                         
                      });
                      
                      res.on('end',()=>{
                          let emArr= String(chunk).match(emReg);
                          op360redArr[n]=0;
                          redArr[n] = '';
                          let emArrLen = 0;
                          if(null != emArr && emArr.hasOwnProperty('length')){
                              emArrLen = emArr.length;
                          }
                          for(var j=0;j<emArrLen;j++){
                              let num=emArr[j].length;
                              //console.log(emArr[j],num-9);
                              if (num>(red+9)) {
                                  op360redArr[n]++;
      
                                  redArr[n] += emArr[j].substring(4,num-5) + '360<br/>';
                              }
                          }
                          callback && callback(n,textArr,emArr)
                      })
                  })
                  req.on('error', (e) => {
                      console.log(e);
                  });
                  req.end();   
              })(i)
        }
    }
    
function getBaiDu(textArr,emReg,editText,allText,callback){
    for(var i=0;i<textArr.length;i++){
        (function(m){
            //文本转码
            var CodeText=encodeURI(textArr[m]);
            // console.log(CodeText);
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
                    
                    callback && callback(m,textArr,emArr)
                })
            });
            req.on('error', (e) => {
                console.log(e);
            });
            req.end();
        })(i)
    }

}

function getDatares(n,textArr,emArr){
    console.log("n:"+n)
    console.log('textarr:'+textArr);
    console.log('emarr:'+emArr);
   }

//飘红
function ChangeRed(data,emReg,textArr){
    //clearTimeout(response_timer);
    //获取所有em标签
    let emArr= String(data).match(emReg);
    //定义变量
    var redNumArr = new Array();//飘红次数数组
    var rate = 0;//原创度百分比
    var redNull = 0;//飘红为0的条数
    var queryNum = 0;//已查询条数
    //记录飘红条数
    redNumArr[m]=0;
    redArr[m] = '';
    //预防null情况
    let emArrLen = 0;
    if(null != emArr && emArr.hasOwnProperty('length')){
        emArrLen = emArr.length;
    }

    for(var j=0;j<emArrLen;j++){
        let num=emArr[j].length;
        //console.log(emArr[j],num-9);
        if (num>(red+9)) {
            redNumArr[m]++;

            redArr[m] += emArr[j].substring(4,num-5) + 'baidu<br/>';
        }
    }
    //console.log('m'+":"+m +":"+ textArr[m]+"redNumArr["+m+"]"+":"+redNumArr[m]);

    //if(m==1 || m==2){console.log(emArr);}
    //如果飘红为0则累计条数
    if(redNumArr[m]==0){
        //先判断是不是最后一句
        if(m == (textArr.length-1)){
            //是最后一句的时候，判断有没有达到字数
            if(textArr[m].length >= ending){
                //达到则累计
                redNull++;
            }
        }else{
            redNull++;
        }
    }else{
        if(m != (textArr.length-1)){
            //渲染飘红
            //let emTxt = emArr[j].substring(4,num-5);console.log(emTxt);
            editText = editText.replace(textArr[m],'<span onmouseover="parent.redText(\''+redArr[m]+'\')" style="border-bottom-color:#FF0000; border-bottom-style:dashed; border-bottom-width:1px;">'+textArr[m]+'</span>');
            //console.log(editText);
            //layedit.setContent(text,editText);
            document.getElementById('LAY_layedit_1').contentWindow.document.getElementsByTagName("body")[0].innerHTML = editText;
        }
    }
    //累计查询次数
    queryNum++;
    //动态修改进度
    var speed = 0;
    speed = 300 - (300 / textArr.length * queryNum);
    //console.log(speed);
    document.getElementById('speed').setAttribute("style","stroke-dasharray: 298.493, 298.493; stroke-dashoffset:"+speed);

    //如果查询次数大于等于文本段数（已查询完成）
    if(queryNum>=textArr.length){
        
        //计算原创度（飘红为0的条数除以总条数）
        rate = Math.floor(redNull/textArr.length*10000) / 100;
        //console.log('queryNum:'+queryNum+" rate:"+rate,textArr.length);
        //显示原创度
        document.getElementById('info').setAttribute("class","detection-over");
        document.getElementById('info').innerHTML = '<span class="score">'+ rate +'%</span><br><span class="tag">原创度</span>';

        //显示表格
        createTable(textArr,redNumArr);
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
//自动保存
function autoSave(allText){
    
    if (allText.length > 20&& (allText.indexOf("。") > -1 || allText.indexOf("，") > -1)) {
    localStorage.setItem("articleValue", allText);
    var d = new Date();
    var YMDHMS = d.getFullYear() + "-"+(d.getMonth() + 1) + "-"+ d.getDate() + " " + d.getHours() + ":"+ d.getMinutes() + ":" + d.getSeconds();
    }   
}

module.exports={CyclicQueryBaiDu,autoSave}