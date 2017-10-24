// # SimpleServer
// A simple chat bot server

var logger = require('morgan');
var http = require('http');
var path          = require('path');
var cookieParser  = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var fetch = require('node-fetch');

var app = express();
var text, _listPlaces, _data, _listPlacesID;
var _lat, _lng;
var _access_token = '3472478267.e029fea.f87d9c4de2fc496198a44cbe2fb5183a';

var instaApi      = require('instagram-node').instagram();
var Bluebird      = require('bluebird');

Bluebird.promisifyAll(instaApi);

var server = http.createServer(app);
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyATW4Bjvh2dLhDXiYwHqf-N_qWmv6pNB5o'
});

app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
      

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
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
          console.log(message.message.text); // In tin nhắn người dùng
          //sendMessage(senderId, "Tui là bot đây: " + text);
          //var url ='https://api.instagram.com/v1/locations/search?lat=48.858844&lng=2.294351&access_token=' + _access_token;
          findLocation(senderId, text);
            console.log(_lat);
            console.log(_lng);
          searchPlacesNearBy(senderId);
        }
      }
    }
  }
  
  res.status(200).send("OK");
});

function findLocation(senderId, text){
  googleMapsClient.geocode({
            address: text
            }, function(err, response) {
                if (!err) {
                  _lat = response.json.results[0].geometry.location.lat;
                  _lng = response.json.results[0].geometry.location.lng;
                  //console.log(_lat);
                  //console.log(_lng);
                  sendMessage(senderId, "Tọa độ của " + text + ": "  + _lat + ", " + _lng);
                  }
              });
}

function searchPlacesNearBy(senderId){
  var url ='https://api.instagram.com/v1/locations/search?lat=' + _lat + '&lng=' + _lng + '&access_token=' + _access_token;
          fetch(url)
            .then(function(res) {
                return res.json();
            }).then(function(json) {
                //console.log(json["data"]);
                _data = json["data"];
                _listPlaces = "";
                console.log(url);
                var i;
                var __btn =
                  {
                    title: "View",
                    type: "web_url",
                    url: "https://peterssendreceiveapp.ngrok.io/collection",
                    messenger_extensions: true,
                    webview_height_ratio: "tall",
                    fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                  }
                var da = {
                  "type": "web_url",
                  "url": "https://peterssendreceiveapp.ngrok.io/view?item=100",
                  "messenger_extensions": true,
                  "webview_height_ratio": "tall",
                  "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                }
                for (i in _data){
                  //_data[i].title  = _data[i].name;
                  //_data[i].subtitle = _data[i].name;
                  //_data[i].default_action = da;
                  //_data[i].image_url = "https://peterssendreceiveapp.ngrok.io/img/collection.png";
                  //_data[i].image_url = "";
                  //_data[i].buttons = __btn;
                  delete _data[i].id;
                  //delete _data[i].name;
                  delete _data[i].latitude;
                  delete _data[i].longitude;
                  _listPlaces += _data[i].name;
                  _listPlaces += "\n"
                }
                console.log(_listPlaces);
                console.log(_data);
                sendMessage(senderId, _listPlaces);
                //sendGenericMessage(senderId);
                //sendDMessage(senderId, i);
            });
}

// var name = "fucking"
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAJZBqRhbaYEBAF5VLVHrJePYbb4hjGTvjyeatEwGnCJMYvpTq2Nm5tTRM82NT06x27HfxR8ruiF6w1UrIhjKHfLfglLzBkB7uG8sQ5s2ZCeKfMdORor6NZBPHT0ggkHL67SFODApm1shUZCwmOLMms5EvszNhOKkK7ga4NuVFpiMxPoadaO",
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
// function sendDMessage(senderId, i) {
//   request({
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: {
//       access_token: "EAAJZBqRhbaYEBAF5VLVHrJePYbb4hjGTvjyeatEwGnCJMYvpTq2Nm5tTRM82NT06x27HfxR8ruiF6w1UrIhjKHfLfglLzBkB7uG8sQ5s2ZCeKfMdORor6NZBPHT0ggkHL67SFODApm1shUZCwmOLMms5EvszNhOKkK7ga4NuVFpiMxPoadaO",
//     },
//     method: 'POST',
//     json: {
//       recipient: {
//         id: senderId
//       },
//       message: {
//         attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [
//             {
//             title: _data[0].name,
//             subtitle: "Next-generation virtual reality",
//             item_url: "https://www.oculus.com/en-us/rift/",               
//             image_url: "http://messengerdemo.parseapp.com/img/rift.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/rift/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for first bubble",
//             }],
//           }, {
//             title: "touch",
//             subtitle: "Your Hands, Now in VR",
//             item_url: "https://www.oculus.com/en-us/touch/",               
//             image_url: "http://messengerdemo.parseapp.com/img/touch.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/touch/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for second bubble",
//             }]
//           }
//         ]  
//         }
//       }
//       },
//     }
//   });
// }

// function sendGenericMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [
//             {
//             title: "rift",
//             subtitle: "Next-generation virtual reality",
//             item_url: "https://www.oculus.com/en-us/rift/",               
//             image_url: "http://messengerdemo.parseapp.com/img/rift.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/rift/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for first bubble",
//             }],
//           }, {
//             title: "touch",
//             subtitle: "Your Hands, Now in VR",
//             item_url: "https://www.oculus.com/en-us/touch/",               
//             image_url: "http://messengerdemo.parseapp.com/img/touch.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/touch/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for second bubble",
//             }]
//           }
//         ]  
//         }
//       }
//     }
//   };  

//   callSendAPI(messageData);
// }

// function callSendAPI(messageData) {
//   request({
//     uri: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: { access_token: 'EAAJZBqRhbaYEBAF5VLVHrJePYbb4hjGTvjyeatEwGnCJMYvpTq2Nm5tTRM82NT06x27HfxR8ruiF6w1UrIhjKHfLfglLzBkB7uG8sQ5s2ZCeKfMdORor6NZBPHT0ggkHL67SFODApm1shUZCwmOLMms5EvszNhOKkK7ga4NuVFpiMxPoadaO' },
//     method: 'POST',
//     json: messageData

//   }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var recipientId = body.recipient_id;
//       var messageId = body.message_id;

//       console.log("Successfully sent generic message with id %s to recipient %s", 
//         messageId, recipientId);
//     } else {
//       console.error("Unable to send message.");
//       console.error(response);
//       console.error(error);
//     }
//   });  
// }


//text = '1600 Amphitheatre Parkway, Mountain View, CA';

app.set('port', process.env.PORT || 5000);
//app.set('ip', process.env.IP || "127.0.0.1");

server.listen(app.get('port'), function() {
  console.log("Chat bot server listening at %s ", app.get('port'));
});

module.exports = app;