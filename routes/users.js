var express = require('express');
var router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

//Models
const User = require('../models/user');


router.get('/register', function(req, res, next) {
  res.render('register', {title: "Register"});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: "Login"});
});

router.post("/register", function(req, res, next) {
    //Get form value
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //Check for image field
    if(req.files && req.files.profileimage){
        console.log("Uploading file...");
        //file info
        var profileImageOgName = req.files.profileimage.originalname;
        var profileImageName = req.files.profileimage.name;
        var profileImageMime = req.files.profileimage.mimetype;
        var profileImagePath = req.files.profileimage.path;
        var profileImageExt = req.files.profileimage.extension;
        var profileImageSize = req.files.profileimage.size;
    }else {
        //set a default Image
        var profileImageName = "noimage.png";
    }

    //Form Validation
    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Invalid Email Id").isEmail();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password2", "Password do not match").equals(req.body.password);

    //Check for error
    var errors = req.validationErrors();

    if(errors){
        res.render("register", {
            errors: errors,
            name: name,
            email: email,
            username: username,
            password: password,
            password2: password2
        });
    }else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            profileimage: profileImageName
        });

        // Create User
        User.createUser(newUser, function(err, user) {
            if(err) throw err;
            console.log(user);
        })

        //Success Message
        req.flash("success", "You are register and may login ");
        res.location("/");
        res.redirect("/")
    }
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new localStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if(err) throw err;
            if(!user){
                console.log("Unknown user");
                return done(null, false, {message: "Unknown User"});
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }else {
                    console.log("Invalid Password");
                    return done(null, false, {message: "Invalid Password"});
                }
            });
        });
    }
));

router.post('/login', passport.authenticate("local", {failureRedirect: "/users/login", failureFlash: "Invalid username or password"}), function(req, res) {
    console.log("Authentication Successful");
    req.flash("success", "You are logged in");
    res.redirect("/")
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have logged out");
    res.redirect("/users/login");
});

module.exports = router;
