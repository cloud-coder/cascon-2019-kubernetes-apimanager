require('dotenv').config();
var { Liquid } = require('liquidjs');
var engine = new Liquid(
{
    root: 'views/',
    extname: '.liquid'
}

);
var express = require('express');
var os = require("os");
var hostname = os.hostname();
var app = express();
var listenPort = process.env.ACCOUNT_SERVICE_SERVICE_PORT;
var fs = require('fs');

function pullDetails(name, req){
  var details = {name: name, hostname: hostname, listenPort : listenPort, reqHostname : req.hostname, reqPath : req.path, headers : JSON.stringify(req.headers)  };
  return details;
}

app.get('/',function(req,res){
    res.redirect('/account')
});

app.get('/account', function(req, res) {

  engine
    .renderFile("main", pullDetails('account', req))
    .then(html => res.send(html))
})

app.get('/account/:accountId', function(req, res) {

      const accountId = req.params.accountId;
      var accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
      
      //get the information for the account
      var account = findElement(accounts, "account_id", accountId);
      if (account === "none") {
        account = '{}';
      }
      var details = pullDetails('account', req);
      res.send(account);

})

function findElement(array, name, value) {
  for (var i=0; i < array.length; i++) {
    if (array[i][name] == value)
      return array[i];
  }
  return "none";
}

app.listen(listenPort, function() {
  console.log('Account Service is listening on port: '+ listenPort)
})
