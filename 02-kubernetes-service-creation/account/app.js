require('dotenv').config();
var express = require('express');
var os = require("os");
var hostname = os.hostname();
var app = express();
var listenPort = process.env.ACCOUNT_SERVICE_SERVICE_PORT;
var fs = require('fs');


app.get('/account', function(req, res) {

  var str = 'Account Service<br/>';
  str += 'I am running on hostname: ' + hostname + '<br/>';
  res.send(str);
})

app.get('/account/:accountId', function(req, res) {

      const accountId = req.params.accountId;
      var accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
      
      //get the information for the account
      var account = findElement(accounts, "account_id", accountId);
      if (account === "none") {
        account = '{}';
      }
      
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
