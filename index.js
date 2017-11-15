var Twitter = require("twitter");
var fs = require("fs");
var createFileString = require("./utils").createFileString;
var winston = require("winston");
var FormData = require("form-data");
var path = require("path");
var mkdirp = require("mkdirp");
var spawn = require("child_process").spawn;
var format = require("util").format;
var Promise = require("bluebird");

var  TOMORROW = 1;

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET

});

var stream = client.stream("statuses/filter", {follow: "851771584079593472"});
stream.on("data", function(data){
    winston.info("Got tweet: " + data.text);
    scheduleReading(data);
});
winston.info("Stream created!");

stream.on("error", function(error){
    winston.error(error);
});

function scheduleReading(tweet){
    winston.info("starting scheduling..");
    
    var date = new Date();
    if(date.getDay() == 2){
        date.setHours(14);
    }else{
        date.setHours(11);
    }
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 1);
    
    var scheduledDate = calculateDateForTask(date, 4);
    winston.info(scheduledDate);
    var time = timeForTask(scheduledDate);
    var pathname = mp3Path(time);
    var lang = (tweet.lang == "en") ? "mov_houda_eng22k" : "mov_houda_frf22k";
    mkdirp(path.dirname(pathname));
    console.log(tweet);
    winston.info(tweet.truncated);
    var text = tweet.truncated ? tweet.extended_tweet.full_text : tweet.text
    winston.info(text);
    synthesizeText(text, lang, pathname).then(function(){
        var at = spawn("at", ['-t', time]);
        at.stdin.write(format("mpg123 %s\n", pathname));
        at.stdin.end();
        at.on("close", function(code){
            winston.info("scheduled for: " + time);
            winston.info("Exited with code: "+ code);
        });
        at.stdout.on('data', function(data){
            process.stdout.write(data);
        })
         
        at.stderr.on('data', function(data){
            process.stdout.write(data);
        })
    });
}

function synthesizeText(text, voice, path){
    return new Promise(function(resolve, reject){
        var data = new FormData();
        data.append("cl_login", process.env.ACAPELA_CL_LOGIN);
        data.append( "cl_app", process.env.ACAPELA_CL_APP);
        data.append( "cl_pwd", process.env.ACAPELA_CL_PWD);
        data.append("req_voice", voice);
        data.append( "req_text", text);
        data.append("req_asw_type", "SOUND");
        data.submit("http://vaas.acapela-group.com/Services/Synthesizer", function(err, res){
            if(!err){
                try{
                    var writeStream = fs.createWriteStream(path);
                    res.pipe(writeStream);
                    writeStream.on("close", function(){
                        resolve();
                    });
                }catch(error){
                    winston.error("Could not write to stream:");
                    winston.error(error);
                    reject(error);
                }
            }else{
                winston.error("There was an Error:");
                winston.error(err)
                reject(error);
            }

        });
    });
}

function dateString(shift){
    var date = new Date();
    date.setDate(date.getDate() + shift);
    return date.toISOString().substr(0, 10);
}

function mp3Path(time){
    return path.resolve("mp3",  dateString(TOMORROW), time);
}

function timeForTask(date){
    return string = format("%s%s%s%s.%s",
        leadingZero(date.getMonth() + 1),
        leadingZero(date.getDate()),
        leadingZero(date.getHours()),
        leadingZero(date.getMinutes()),
        leadingZero(date.getSeconds()))
}

function calculateDateForTask(startDate, scale){
    var now = new Date();
    var startOfDay = new Date();
    startOfDay.setHours(0);
    startOfDay.setMinutes(0);
    startOfDay.setSeconds(0);
    var time = startDate.getTime() + Math.floor((now.getTime() - startOfDay.getTime())/scale);
    return new Date(time); 
}

function leadingZero(time){
    return (time < 10 ? "0" : "") + time
}

