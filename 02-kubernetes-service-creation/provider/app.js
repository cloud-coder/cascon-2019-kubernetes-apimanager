var express = require('express')
var os = require("os");
var hostname = os.hostname();
var app = express()
var listenPort = 8080;

app.get('/', function(req, res) {

      var str = 'Private Provider Application<br/>';
      str += 'I am hostname: ' + hostname + '<br/>';
      str += 'Your app is up and running in a cluster!<br/>';
  
      res.send(str);
})

app.listen(listenPort, function() {
  console.log('Provider Application is listening on port: '+ listenPort)
})
