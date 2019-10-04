require('dotenv').config();
var express = require('express')
var os = require("os");
var hostname = os.hostname();
var app = express()
var listenPort = process.env.PROVIDER_SERVICE_SERVICE_PORT;
var fs = require('fs');

app.get('/provider', function(req, res) {

      var str = 'Provider Service<br/>';
      str += 'I am running the provider service on hostname: ' + hostname + '<br/>';
      res.send(str);
})

app.get('/provider/:providerId', function(req, res) {

  const providerId = req.params.providerId;
  var providers = JSON.parse(fs.readFileSync('providers.json', 'utf8'));
  
  //get the information for the provider
  var provider = findElement(providers, "provider_id", providerId);
  if (provider === "none") {
    provider = '{}';
  }

  res.send(provider);
})

function findElement(array, name, value) {
for (var i=0; i < array.length; i++) {
if (array[i][name] == value)
  return array[i];
}
return "none";
}


app.listen(listenPort, function() {
  console.log('Provider Application is listening on port: '+ listenPort)
})
