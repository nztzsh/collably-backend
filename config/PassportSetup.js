const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
  passReqToCallback: true
},
  async function(req, username, password, done) {
    try{
      var user = await User.findOne({ username: username });
      if (!user) {
        req.authError = 'Incorrect username';
        return done(null, false);
      }
      if (!(await bcrypt.compare(password, user.password))) {
        req.authError = 'Incorrect password'
        return done(null, false);
      }
      return done(null, user);
    } catch(err){
      console.log(err.message);
      return done(err);
    }
  }));