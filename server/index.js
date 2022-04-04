'use strict';

require('dotenv').load();

const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
var randomName = require('../common/randomname').randomName;
var generateToken = require('../common/randomname').generateToken;

const Twilio = require('twilio');

const client = new Twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_API_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID
  },
);

// Create Express webapp.
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Set up the path for the web pages.
var webPath = path.join(__dirname, '../web/public');
app.use('/web', express.static(webPath));


app.get('/', function (request, response) {
  console.log('helo')
  response.redirect('/web');
});


app.post('/webhook', (req, res) => {
  console.log(req.body);

  if (req.body.StatusCallbackEvent !== 'room-created') {
    res.status(200).send();
    return;
  }

  console.log('Session has ended. Starting composition of tracks!!');
  client.video.compositions.
    create({
      roomSid: req.body.RoomSid,
      audioSources: '*',
      videoLayout: {
        grid: {
          video_sources: ['*']
        }
      },
      statusCallback: 'https://d05e8e9d70e0.ngrok.io/webhook',
      format: 'mp4'
    })
    .then(composition => {
      console.log("Created Composition with SID=" + composition.sid);
    })
    .catch(err => {
      console.log("Room Sid: ", req.body.RoomSid);
      console.log("Webhook Error: ", err)
    });
  res.status(200).send();
});

app.get('/token', function (request, response) {
  var identity = request.query.identity || randomName();

  var obj = generateToken(identity);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send(obj);
});


// Create http server and run it.
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Express server running on *:' + port);
});