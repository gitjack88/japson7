// (function(){
//     function edit (){
//         this.init();
        
//     }
//     edit.prototype = {
//         redArr = new Array(),//飘红数组
//         redNumArr = new Array(),//飘红次数数组
//         rate = 0,//原创度百分比
//         redNull = 0,//飘红为0的条数
//         queryNum = 0,//已查询条数
        
//     }
// }(window))

    function edit(textArr,allText,Objdata,defaultValue){
        this.init(textArr,allText,Objdata,defaultValue);
        const settings = require('electron-settings');
        const {ipcRenderer} = require('electron');
    }
    edit.prototype = {
        overbaidu : false,
        over360 : false,
        o : 0,
        textArrLen : 0,
        searchTool :2,
        d :1,
        emReg: /<em>(.*?)<\/em>/g,
        redNumArrBaidu : new Array(),//百度飘红次数数组
        redNumArr360 : new Array(),//360

        rate : 0,//原创度百分比
        redNull : 0,//飘红为0的条数
        ending : 5,//最后一段字数（最后一段少于多少个字，不计入原创度算法）
        selectedred :0,
        init:function (textArr,allText,Objdata,defaultValue){
            this.d = 1;
            this.o = 0;
            this.rate = 0;
            this.redNull= 0;
            this.over360 =false;
            this.overbaidu = false;
            this.textArrLen = textArr.length;
        
            this.baidu(textArr,allText,Objdata,defaultValue,Callback);
            this.three60(textArr,allText,Objdata,defaultValue,Callback);
        },
        // 定义一个回调函数
        paly:function (res,textArr,allText,defaultValue){ 
            var self = this;
            console.log(self.textArrLen,res);
            if(res == 'queryNum'){
                o ++;
                //动态修改进度
                var speed = 0;
                speed = 300 - (300 / (self.textArrLen * self.searchTool) * self.o);
                
                document.getElementById('speed').setAttribute("style","stroke-dasharray: 298.493, 298.493; stroke-dashoffset:"+speed);
                
            }
            if(self.overbaidu&&self.over360){
                // console.log(overbaidu,over360+"回调")       
                    //计算原创度（飘红为0的条数除以总条数）
                    self.rate = Math.floor(self.selectedred/self.textArrLen*10000) / 100;
                    //console.log('queryNum:'+queryNum+" rate:"+rate,textArr.length);
                    //显示原创度
                    document.getElementById('info').setAttribute("class","detection-over");
                    document.getElementById('info').innerHTML = '<span class="score">'+ self.rate +'%</span><br><span class="tag">原创度</span>';
                
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
                        a1.innerHTML = self.redNumArrBaidu[k];
                        //var tdContent = document.createTextNode(redNumArr[k]);
                        td.appendChild(a1);
                        //tr中添加该单元格
                        tr.appendChild(td);
                        //创建第四个单元格
                        var td = document.createElement("td");
                        //创建a标签
                        var a2 = document.createElement("a");
                        a2.setAttribute("href","javascript:void(0);");
                        
                        a2.setAttribute("onclick","send('https://www.so.com/s?ie=utf-8&fr=hao_360so&src=home_hao_360so&q=="+encodeURI(textArr[k])+"')");
                        a2.innerHTML = self.redNumArr360[k];
                        
                        //var tdContent = document.createTextNode(redNumArr[k]);
                        td.appendChild(a2);
                        //tr中添加该单元格
                        tr.appendChild(td);
                        document.getElementById('tbody').appendChild(tr);
                    
                    }
                    defaultValue.now_word_count = allText.length;
                    defaultValue.now_rate = self.rate;
        
                    //判断字数是否达标
                    if(allText.length < defaultValue.word_count || self.rate < Objdata.original){
                        document.getElementById('go').innerHTML = '字数或者原创度还没达到标准哦！';
                    }else{
                        document.getElementById('go').innerHTML = '<button class="layui-btn" lay-submit lay-filter="put">立即提交</button>';
                    }
                    //显示表格
                    document.getElementById('table').style.display="block";
                                    
                    document.getElementById('msg').innerHTML = '要求字数：'+defaultValue.word_count+' 当前字数：'+allText.length+'  要求原创度：'+Objdata.original+ ' 当前原创度：'+self.rate;
            }
            // console.log(o)
            
        },
        baidu:function(textArr,allText,Objdata,defaultValue,callback){
            // console.log(Objdata);
            var self =this;

            var queryNum = 0;//已查询条数
            for(var i=0;i<self.textArrLen;i++){
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
                            //累计查询次数
                            queryNum++;
                            //如果查询次数大于等于文本段数（已查询完成）
                            if(queryNum>=self.textArrLen){
                                self.overbaidu = true;
                            }
                            
                            d++;
                            let emArr= String(code).match(emReg);
                            //记录飘红条数
                            self.redNumArrBaidu[m]=0;
                            for(var j=0;j<emArr.length;j++){
                                let num=emArr[j].length;
                                
                                if (num>(red+9)) {
                                    self.redNumArrBaidu[m]++;
        
                                }
                                
                            }
        
                            //如果飘红为0则累计条数
                            if( self.redNumArrBaidu[m]==0){
                                //先判断是不是最后一句
                                if(m == (self.textArrLen-1)){
                                    //是最后一句的时候，判断有没有达到字数
                                    if(textArr[m].length >=  self.ending){
                                        //达到则累计
                                        self.redNull++;
                                    }
                                }else{
                                    self.redNull++;
                                }
                                if(Objdata.searchtype ==1){
                                    self.selectedred =  self.redNull;
                                }
                            }
                            callback && callback('queryNum',textArr,allText,defaultValue)
                            
                            
                        })
                    });
                    req.on('error', (e) => {
                        console.log(e);
                    });
                    req.end();
                })(i)
            }
        },
        three60:function (textArr,allText,Objdata,defaultValue,callback){
            var self = this;
            var queryNum = 0;//已查询条数
            for(var i=0;i<self.textArrLen;i++){
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
                            //累计查询次数
                            queryNum++;
                            //如果查询次数大于等于文本段数（已查询完成）
                            if(queryNum>=self.textArrLen){
                                self.over360 = true;
                            }
                            let emArr= String(chunk).match(self.emReg);
                            // console.log(emarr);
                            //记录飘红条数
                            self.redNumArr360[n]=0;
                            for(var j=0;j<emArr.length;j++){
                                let num=emArr[j].length;
                                
                                if (num>(red+9)) {
                                    self.redNumArr360[n]++;
                                }
                            }
                            //如果飘红为0则累计条数
                            if(self.redNumArr360[n]==0){
                                //先判断是不是最后一句
                                if(n == (self.textArrLen-1)){
                                    //是最后一句的时候，判断有没有达到字数
                                    if(textArr[n].length >= ending){
                                        //达到则累计
                                        self.redNull++;
                                    }
                                }else{
                                    self.redNull++;
                                }
                                
                                if(Objdata.searchtype == 0){
                                    self.selectedred = self.redNull;
                                }
                            }
                            
                            callback && callback('queryNum',textArr,allText,defaultValue)
                            
                        })
                    })
                    req.on('error', (e) => {
                        console.log(e);
                    });
                    req.end();   
                })(i)
            }
        }
    };
        window.prototype.$ = function(){
            var obj = new edit(textArr,allText,Objdata,defaultValue);
        }
    module.exports = {$}

