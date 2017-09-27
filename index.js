var Twitter = require('twitter');
var fs = require('fs')
var createFileString = require('./utils').createFileString;
var winston = require('winston');

winston.info("Initializing client");
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET

})
var lastTweetAt;

winston.info("Creating stream");
var stream = client.stream('statuses/filter', {follow: '851771584079593472'});
winston.info("Stream created!")
stream.on('data', function(event){
    var now = Date.now()
    winston.info("Tweet recived: " + event.text);
    var path = createFileString();
    winston.info("Looking for previously saved tweets in: " + path + "...");
    fs.readFile(path, 'utf8', function(err, data){
        if(!err){
            winston.info("Tweets found!");
            winston.info("Parsing file data..");
            try{
                var tweets = JSON.parse(data);
                winston.info("Sucess!");
                event.delta = now-lastTweetAt;
                tweets.push(event);
                writeToFile(path, tweets);
            }catch(error){
                winston.error("Could not parse the file data")
                winston.error(error);
            }
        }else{
            winston.info("No privious tweets found")
            winston.info("Starting scheduling process...")
            event.delta=0;
            writeToFile(path, [event]);
        }
        lastTweetAt = now;
    })    
});

stream.on('error', function(error){
    console.log(error);
})


function writeToFile(path, tweets){
    winston.info("Saving tweet to: " + path);
    fs.writeFile(path, JSON.stringify(tweets), function(err){
        if(err){
            winston.error("Could not write to file!"); 
            winston.error(err);
        }else{
            winston.info("Success!");
        }
    });
}
