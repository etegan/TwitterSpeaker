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








