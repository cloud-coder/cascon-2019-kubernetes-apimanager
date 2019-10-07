require('dotenv').config();
var express = require('express');
var request = require('request');
var os = require("os");
var hostname = os.hostname();
var app = express();
var listenPort = process.env.COST_SERVICE_SERVICE_PORT;


app.get('/cost', function(req, res) {

  var str = 'Cost Service<br/>';
  str += 'I am running the cost service on hostname: ' + hostname + '<br/>';
  res.send(str);
})

app.get('/cost/:accountId', function(req, res) {

      var accountId = req.params.accountId;

      // wrap a request in an promise
      function callURL(url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (error) reject(error);
                if (response.statusCode != 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }
                resolve(body);
            });
        });
      }

      async function retrieveAccountDetails(accountId) {
        try {
            console.log('Retrieving the account information for the account ' + accountId);

            var accountDetails = await callURL('http://'+process.env.ACCOUNT_SERVICE_SERVICE_HOST+':'+process.env.ACCOUNT_SERVICE_SERVICE_PORT+'/account/'+accountId)
            var providers = JSON.parse(accountDetails).providers;
            var cost = 0;
            for (var i=0 ; i < providers.length ; i++) {
              console.log('This user subscribes to ' + providers[i]);
              var provider = await callURL('http://'+process.env.PROVIDER_SERVICE_SERVICE_HOST+':'+process.env.PROVIDER_SERVICE_SERVICE_PORT+'/provider/'+providers[i]);
              var providerObject = JSON.parse(provider);
              console.log('Retrieved a cost of ' + providerObject.cost + ' for the provider ' +providerObject.provider_id);
              cost += providerObject.cost;
            }
            return cost;
        } catch (error) {
            console.error(error);
        }
      }

      //hold thee response until all data is collected
      new Promise(function(resolve, reject) {
        var cost = retrieveAccountDetails(accountId);
        resolve(cost); 
      }).then(function(cost) { 
        if (cost === undefined) cost = 'Account not found';
        console.log('The total cost for the account ' + accountId + ' is ' + cost);
        res.send('{"account_id":"'+accountId+'", "totalCost":"' + cost + '"}');
      });
  
})

app.listen(listenPort, function() {
  console.log('Cost Service is listening on port: '+ listenPort);
})
