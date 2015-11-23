var exports = module.exports = {};
var app = require('app');
var BrowserWindow = require('browser-window');
require('crash-reporter').start();
var mainWindow = null;
var loginWindow = null;
var ipc = require('ipc');
var nodeCrypto = require('crypto');
var lCookies = [];
var process = require('process');
var opener = require('opener');
var path = require('path-extra');
//var spawnly = require('spawnly');

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {

    var subemail;
    var emails_path = path.normalize(path.join(__dirname, 'node_modules', 'emails', 'build', 'server.js'));
    console.log(emails_path);
    if (process.platform == 'win32') {

        subemail = require('child_process').fork(emails_path, [], {silent: true});
    }

    else
        subemail = require('child_process').spawn('node', [emails_path], {'stdio': 'inherit'});

    console.log('WebMail should be ready');



    loginWindow = new BrowserWindow({width: 400, height: 450, 'node-integration': true, javascript: true});

    loginWindow.loadUrl('file://' + __dirname + '/login.html');

    loginWindow.on('closed', function () {
        loginWindow = null;
    });

    loginWindow.webContents.on("did-frame-finish-load", function () {
        loginWindow.webContents.session.cookies.remove({name: "sessionid", url: "https://www.sdw.solutions"}, function(error) {
            if (error) console.log(error);
           console.log('cookie removed');
        });
        loginWindow.webContents.session.cookies.remove({name: "csrftoken", url: "https://www.sdw.solutions"}, function(error) {
            if (error) console.log(error);
           console.log('cookie removed');
        });

    });

    ipc.on('loggedin-message', function (event, msg) {
        loginWindow.webContents.session.cookies.get({domain: "www.sdw.solutions"}, function (error, cookies) {
            console.log(loginWindow.webContents);
            if (error)
                console.log("Error get cookies Login Window");
            else {
                if(cookies.length==2) {
                    if (cookies[0].name == "csrftoken" && cookies[1].name == "sessionid") {
                        lCookies = cookies;
                        mainWindow = new BrowserWindow({
                            width: 800,
                            height: 600,
                            'node-integration': true,
                            javascript: true
                        });
                        mainWindow.loadUrl('file://' + __dirname + '/main.html');
                        mainWindow.webContents.on("did-finish-load", function () {
                        mainWindow.webContents.send('cookies-message', lCookies);
                            exports.lCookies = lCookies
                            var watcher = require('./watcher.js');
                            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
                        });


                        mainWindow.on('closed', function () {
                            mainWindow = null;
                            var console = require('console');
                            console.log('Killed WebMail');
                            subemail.kill('SIGINT');
                        });
                        loginWindow.destroy();
                    }
                }
            }
        });
    });


    ipc.on('logout', function() {

    loginWindow.webContents.session.cookies.remove({name: "sessionid", url: "https://www.sdw.solutions"},
        function(error)
        {
            if (error)
                console.log(error)
            console.log('cookies removed');

        })
    });

    ipc.on('show-file', function (event, path) {
        console.log(path);
        var editor = opener(path);

    });


});

