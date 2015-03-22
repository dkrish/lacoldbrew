var relayr = require('relayr');
var config = require('./config.json');
var request = require('request');
var client = require('twilio')(config.twilio.accountSid, config.twilio.authToken); 

//connect to relayr pubnub cloud
var relayrKeys = {
  app_id: config.relayr.appId,
  dev_id: config.relayr.devId,
  token:  config.relayr.token
};
relayr.connect(relayrKeys);

var tsBeer = -1;

relayr.listen(function(err,data)
{
  //fires for every sensor event
  if (err)
  {
      console.log("Oh No!", err)
  }
  else
  {
    if (tsBeer !== -1)
    {
      //console.log(data);
      console.log(Math.round(((tsBeer + 1000) - data.ts) / 1000)
      + ' seconds to go before reading the temperature of your beer');
    }

    //console.log(data);
    if (data.ts < tsBeer) return;

    if (tsBeer === -1) tsBeer = data.ts;

    //send a text once beer is cold enough
    if (data.temp < 15.00)
    {

        console.log('Your cold, frosty brew is ready! Sending a text brah');

        client.messages.create({ 
          to: "[thirsty person's phone number goes here]", 
          from: "[twilio number goes here]", 
          body: "Your beer is ready!",   
        }, function(err, message) { 
          //console.log(message.sid); 
        });

      //reset timer to 30 seconds
      tsBeer = data.ts + 1000 * 60;
    }
    else //if beer is too warm
    {
      //reset timer to 30 seconds
      console.log('Beer is still too warm! Restarting counter');
      tsBeer = data.ts + 1000 * 30;
    }
  }
});
