const User = require('../models/user');

async function validateNewUser(user){
  var count = await User.countDocuments({username: user});
  if(count>0){
    return false;
  }else{
    return true;
  }
};

module.exports = validateNewUser;