var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var FB = require('fb');


var ACCESS_TOKEN = ''
FB.options({accessToken: ACCESS_TOKEN})

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

/**
 * MAIN FUNCTION TO HANDLE MESSAGES
 */
var handleMessage = function (event) {
  var USER_ID = event.sender.id
  var RECIPIENT_ID = event.recipient.id
  var MESSAGE = event.message.text
  if (false) {
    // TODO: ADD some condition
    // TODO: ADD sendMessage function to return something to user
  } else if (isContainText('hi', MESSAGE)) {
    FB.api(USER_ID, {fields: ['first_name']},  function (res) {
      if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      return;
      }
      sendSimpleText(USER_ID, `Hi "${res.first_name}", may I help you?`);
    });
      return
  }
  // If we get unknow pattern, answer that "I can not understand"
  sendSimpleText(USER_ID, 'Sorry, I cannot understand what you mean');
};

/**
 * FUNCTION TO HANDLE POSTBACK(Push button callback)
 */
var handlePostBack = function (event) {
  var USER_ID = event.sender.id
  var RECIPIENT_ID = event.recipient.id
  var PAYLOAD = event.postback.payload
  if (PAYLOAD === 'BUTTON_3') {
    sendSimpleText(USER_ID, 'You pushed third button');
  }
  // If we get unknow pattern, answer that "I can not understand"
  sendSimpleText(USER_ID, 'Sorry, I cannot understand what you mean');
};

var isContainText = function (text, message) {
  return message.toLowerCase().search('hi')
}

/**
 * generic function sending messages
 */
var sendSimpleText = function (recipientId, message) {
  sendMessage(recipientId, {text: message});
};

var sendMessage = function (recipientId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN || ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};



/**
 * Cores
 */
// Server frontpage
app.get('/', function (req, res) { res.send('Server is running'); });

// Facebook Webhook
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'testbot_verify_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
  var events = req.body.entry[0].messaging;
  for (i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.message && event.message.text) {
      handleMessage(event)
    }
    if (event.postback) {
      handlePostBack(event)
    }
  }
  res.sendStatus(200);
});
