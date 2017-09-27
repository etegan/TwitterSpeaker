require('es6-promise').polyfill();
require('isomorphic-fetch');
var FormData = require('form-data');
var fs = require('fs');
exports.createFileString = function(){
    var today = new Date();
    return './tweets/' + today.toISOString().substr(0,10) 
};

exports.createYesterdayFileString = function(){
    var today = new Date();
    var yesterday = today.setDate(today.getDate() - 1);
    return './tweets/' + yesterday.toISOString().substr(0,10) 
}

exports.synthesizeText= function(text, func){
    var data = new FormData()
    data.append('cl_login', process.env.ACAPELA_CL_LOGIN)
    data.append( 'cl_app', process.env.ACAPELA_CL_APP)
    data.append( 'cl_pwd', process.env.ACAPELA_CL_PWD)
    data.append('req_voice', 'elin22k');
    data.append( 'req_text', text)
    data.append('req_asw_type', "SOUND");
    data.submit('http://vaas.acapela-group.com/Services/Synthesizer', func);
}


exports.synthesizeText("Här har vi lite testtext", function(err, res){
    var stream = fs.createWriteStream("test.mp3");
    res.pipe(stream);
})

