var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn
var format = require('util').format;
var Promise = require('bluebird');
exports.createFileString = function(){
    var today = new Date();
    return './tweets/' + createDateString(today); 
};

exports.createYesterdayFileString = function(){
    var today = new Date();
    today.setDate(today.getDate() - 1);
    return './tweets/' + createDateString(today); 
}

exports.scheduleTextReading = function(text, time){
    var dir = mp3Path();
    var file = path.resolve(dir, time+".mp3")
    console.log(file);
    mkdirp(dir);
    synthesizeText(text, file).then(function(){
        var at = spawn('at',[time]);
        at.stdin.write(format('mpg123 %s\n', file));
        at.stdin.end();
        at.on('close', function(code){
            console.log(`Exited with code: ${code}`);
        })
    })
}



function synthesizeText(text, path){
    return new Promise(function(resolve, reject){
        var data = new FormData()
        data.append('cl_login', process.env.ACAPELA_CL_LOGIN)
        data.append( 'cl_app', process.env.ACAPELA_CL_APP)
        data.append( 'cl_pwd', process.env.ACAPELA_CL_PWD)
        data.append('req_voice', 'elin22k');
        data.append( 'req_text', text)
        data.append('req_asw_type', "SOUND");
        data.submit('http://vaas.acapela-group.com/Services/Synthesizer', function(err, res){
            var stream = fs.createWriteStream(path);
            res.pipe(stream);
            stream.on('close', function(){
                resolve();
            })
        })
    });
}

function mp3Path(){
    return path.resolve('mp3', createDateString(new Date()));
}

function createDateString(date){
    return date.toISOString().substr(0, 10);
}

