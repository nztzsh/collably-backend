require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
require('./config/PassportSetup');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(cors({credentials: true, origin: process.env.CLIENT_ORIGIN}));

app.use(cookieParser());

// parse application/json
app.use(bodyParser.json())

//Connect to DB
mongoose.connect(process.env.DB_URI,
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Connection established");
    }
  });

//Set cookies
app.use(cookieSession({
    maxAge: 360*24*60*60*1000,
    keys: [process.env.SESSION_KEY]
  }));
  
//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/auth', authRoutes);
app.use('/project', projectRoutes);

app.listen(process.env.PORT, function(){
    console.log('Listening to port ' + process.env.PORT);
});