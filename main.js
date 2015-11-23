var app = require('app');
var BrowserWindow = require('browser-window');
require('crash-reporter').start();
var mainWindow = null;
var process = require('process');
var path = require('path-extra');
var fs = require('fs');

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {

    if(process.env.POUCHDB_NAME === undefined) {
      var defaultDir = path.join(path.homedir(), '.emails');
      if(!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir);
      }
      process.chdir(defaultDir);
    }

    var root = path.join(__dirname, 'node_modules', 'cozy-emails', 'build');
    var start = require(path.join(root, 'server'));
    start({root:root, dbName: 'db'}, function() {});

    global.MODEL_MODULE = 'pouchdb';

    mainWindow = new BrowserWindow({
                            width: 1024,
                            height: 800,
                            'node-integration': true,
                            javascript: true
                        });

    mainWindow.loadUrl('file://' + __dirname + '/main.html');

});

