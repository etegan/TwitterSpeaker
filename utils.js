var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var spawn = require('child_process').spawn
exports.createFileString = function(){
    var today = new Date();
    return './tweets/' + createDateString(today); 
};

exports.createYesterdayFileString = function(){
    var today = new Date();
    var yesterday = today.setDate(today.getDate() - 1);
    return './tweets/' + createDateString(yesterday); 
}

exports.scheduleTextReading = function(text, time){
    var dir = mp3Path();
    mkdirp(dir);
    synthesizeText(text, path.resolve(dir, time+".mp3"));
}

function synthesizeText(text, path){
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
    })
}

function mp3Path(){
    return path.resolve('mp3', createDateString(new Date()));
}

function createDateString(date){
    return date.toISOString().substr(0, 10);
}

var at = spawn('at',['1609']);
at.stdin.write('mpg123 test.mp3\n');
at.stdin.end();
at.on('close', function(code){
    console.log(`Exited with code: ${code}`);
})
