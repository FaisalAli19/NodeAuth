const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://localhost/nodeauth");
mongoose.connect("mongodb://heroku_j22sgq5z:pmeabt59odl0dfobe0oq4kqpm9@ds119810.mlab.com:19810/heroku_j22sgq5z");

if(env === "development"){
    mongoose.connect("mongodb://localhost/nodeauth");
}else{
    mongoose.connect("mongodb://heroku_j22sgq5z:pmeabt59odl0dfobe0oq4kqpm9@ds119810.mlab.com:19810/heroku_j22sgq5z");
}

var db = mongoose.connection;

//User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: "string",
        index: true
    },
    password: {
        type: "string",
        required: true,
        bcrypt: true
    },
    email: {
        type: "string"
    },
    name: {
        type: "string"
    },
    profileimage: {
        type: "string"
    }
});

var User = module.exports = mongoose.model("User", UserSchema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash) {
        if(err) throw err;
        //Set hashed password
        newUser.password = hash;
        newUser.save(callback)
    })
};

module.exports.getUserByUsername = function(username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) return callback(err);
        callback(null, isMatch);
    });
};
