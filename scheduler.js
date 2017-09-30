var fs = require('fs');
var createYesterdayFileString = require('./utils.js').createYesterdayFileString;
var scheduleTextReading = require('./utils.js').scheduleTextReading;
var format = require('util').format;


exports.scheduleTweets = function(){
    var filePath = createYesterdayFileString();
    fs.readFile(filePath, 'utf8', function(err, data){
        if(!err){
            var today = new Date();
            try{
                tweets = JSON.parse(data);
                tweets.forEach(function(tweet){
                    timeString = calculateTime(tweet);                   
                    //scheduleTextReading(tweet.text, timeString);
                    console.log(timeString);
                })

            }catch(error){
                console.log("Could not parse file data!");
                console.log(error);
            }
        }
    })  
}

function calculateTime(tweet){
    var startTime;
    if((new Date()).getDay() != 3){
        startTime = 11;
    }else{
        startTime = 14;
    }
    var time = new Date(tweet.time);
    console.log(tweet.time);
    time.setHours(time.getHours()/6+11);
    time.setMinutes(time.getMinutes/6);
    return format('%s%s',
        (time.getHours()<10?"0":"") + time.getHours(), 
        (time.getMinutes()<10?"0":"") + time.getMinutes())
}

exports.scheduleTweets();
