var express = require('express')
var rp = require('request-promise');
var os = require("os");
var hostname = os.hostname();
var app = express()
var listenPort = 8080;

const http = require('http')

function processAccount(str){
  console.log('Do Something');
  return "No Accounts<br/>";
}

function processProvider(str){
  console.log('Do Something');
  return "No Providers<br/>";
}

app.get('/', function(req, res) {

      var str = 'Private MonthlyCost Application<br/>';
      str += 'I am hostname: ' + hostname + '<br/>';
      str += 'Your app is up and running in a cluster!<br/>';

      var options1 = {
        hostname: 'account-service',
        path: '/',
        port: 8080,
        method: 'GET'
      }
      var options2 = {
        hostname: 'provider-service',
        path: '/',
        port: 8080,
        method: 'GET'
      }
      console.log('Promising...');

      Promise.all([
        rp('http://' + process.env.ACCOUNT_SERVICE_SERVICE_HOST + ':' + process.env.ACCOUNT_SERVICE_SERVICE_PORT + '/'),
        rp('http://' + process.env.PROVIDER_SERVICE_SERVICE_HOST + ':' + process.env.PROVIDER_SERVICE_SERVICE_PORT + '/')
      ]).then (values  => {
        str += processAccount(values[0]);
        str += processProvider(values[1]);
        res.send(str);
      }).catch(function(err) {
        // dispatch a failure and throw error
        throw err;
      });
  
})

app.listen(listenPort, function() {
  console.log('MonthlyCost Application is listening on port: '+ listenPort)
})
