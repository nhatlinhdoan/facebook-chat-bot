// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);


var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyATW4Bjvh2dLhDXiYwHqf-N_qWmv6pNB5o'
});


var text;
var lat, lng;


app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === '1412286') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === '1412286') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          text = message.message.text;
          console.log(text); // In tin nhắn người dùng
          sendMessage(senderId, "Tui là bot đây: " + text);
        }
      }
    }
  }

  res.status(200).send("OK");
});


function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAJZBqRhbaYEBAAJTAwiWhoSY3STRhsjHTloYPALvvKOo5NJooR8uzrvEotHZBtU8TQJMYHsKcrka5Tvy1m3w7Ar5wXs99wBZAYLEE0oIZAcBS8VuYPjk6inphI4ZCIoyQL2ViFJzLzZCwgi8hLZAMQNEySHn58VjmG0mN1h6NxzyepQANnZA85i",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}


googleMapsClient.geocode({
  address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err, response) {
  if (!err) {
    lat = response.json.results[0].geometry.location.lat;
    lng = response.json.results[0].geometry.location.lng;
    console.log(lat);
    console.log(lng);
  }
});


app.set('port', process.env.PORT || 5000);
//app.set('ip', process.env.IP || "127.0.0.1");

server.listen(app.get('port'), function() {
  console.log("Chat bot server listening at %s ", app.get('port'));
});
