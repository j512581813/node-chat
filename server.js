const  http = require("http")


const names = [];
const express = require('express'), //引入express模块
    app = express(),
    server = require('http').createServer(app).listen(9099),
    io = require('socket.io').listen(server);
	app.use('/',(req,res)=>{
		res.sendFile(__dirname + '/index.html');
	});
	server.listen(80);

	io.on('connection', function(socket) {
	    //接收并处理客户端发送的login事件
	    socket.on('login', function(nickname) {
	       if(names.indexOf(nickname)< 0){
	       		names.push(nickname);
	       		console.log(nickname);
	       		socket.userIndex = names.length;
            	socket.nickname = nickname;
	       		socket.emit('loginSuccess');
            	io.sockets.emit('system', nickname, names.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
	       }else{
	       		socket.emit('nickExisted');
	       }
	    });
	    //断开连接的事件
		socket.on('disconnect', function() {
		    //将断开连接的用户从users中删除
		    names.splice(socket.userIndex, 1);
		    //通知除自己以外的所有人
		    socket.broadcast.emit('system', socket.nickname, names.length, 'logout');
		});
		//接受新消息
		socket.on('postMsg', function(msg) {
        //将消息发送到除自己外的所有用户
        	socket.broadcast.emit('newMsg', socket.nickname, msg);
    	});
    	//接收用户发来的图片
	 	socket.on('img', function(imgData) {
		    //通过一个newImg事件分发到除自己外的每个用户
	     	socket.broadcast.emit('newImg', socket.nickname, imgData);
	 	});
	});

console.log("node-chat is begining");