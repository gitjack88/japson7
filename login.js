const {ipcRenderer} = require('electron');
const settings = require('electron-settings');



function login () {
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	console.log(username,password);
	settings.set("user", {username: username, password: password});

	var xhr = new XMLHttpRequest();
    xhr.open('GET','http://fawen.api.gd/api/v1/login?username='+username+'&password='+password,true);
    xhr.onreadystatechange = function(event){
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                var data = JSON.parse(xhr.response);
                console.log(data.msg);
				layer.msg(data.msg);
				if(data.code == 1){
					settings.set("user", {token: data.token, name: data.name});
					ipcRenderer.send('login-msg', 'ok');
				}
            }
        }
    };
    xhr.send(null);

}

