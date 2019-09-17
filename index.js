  var SlackBot = require("slackbots");
  var schedule = require('node-schedule');
  var express = require("express");
  var app = express();
  var channel = "General";
  var port = process.env.PORT || 8080;

  var server = app.listen(port,function() {
  console.log("app running on port 8080"); });

  var bot = new SlackBot({
      token: 'xoxb-604611695190-762654333568-pL9ZOjjHRfkvqDbFkvOIXK88',
      name: "Beer"
  });


  bot.on("start", function() {
    var arr = [ "I work until beer o'clock. Grab some?",
                "Should we grab some beer?  A)Yes   B)A   C)B",
                "Who needs a MAS when there's beer. Let's get one.",
                "Stop trying to make everyone happy. You're not a beer.",
                "Save water. Drink beer. Do you wanna be a water saver?",
                "Anytime you're sad, remember this: Beer.",
                "So many beers, so little time. Waste your time today!",
                "I got 99 problems and beer solves all of them.",
                "Shhhh.... yep I hear... A beer calling me!",
                "Beauty is in the eye of the beer holder. Let's enjoy this beauty today!",
                "Beer! Because you can't drink bacon (or quinoa for the vegans).",
                "Wish you were beer!" ];

                //30 16 * * 5
                var scheduler = schedule.scheduleJob('25 11 * * 2', function(){
                  var random = arr[Math.floor(Math.random() * arr.length)];
                  bot.postMessageToChannel(channel, random);
                });


  });
