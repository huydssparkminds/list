var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken')
var configs = require('../config/config')

var studentSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    age: String,
    avatar: String
}, { timestamps: true })



module.exports = new mongoose.model('student', studentSchema);