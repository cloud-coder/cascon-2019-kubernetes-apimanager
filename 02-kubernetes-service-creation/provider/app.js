require('dotenv').config();
var { Liquid } = require('liquidjs');
var engine = new Liquid(
{
    root: 'views/',
    extname: '.liquid'
}

);
var express = require('express')
var os = require("os");
var hostname = os.hostname();
var app = express()
var listenPort = process.env.PROVIDER_SERVICE_SERVICE_PORT;
var fs = require('fs');

function pullDetails(name, req){
  var details = {name: name, hostname: hostname, listenPort : listenPort, reqHostname : req.hostname, reqPath : req.path, headers : JSON.stringify(req.headers)  };
  return details;
}

app.get('/',function(req,res){
    res.redirect('/provider')
});

app.get('/provider', function(req, res) {

  engine
    .renderFile("main", pullDetails('provider', req))
    .then(html => res.send(html))

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
