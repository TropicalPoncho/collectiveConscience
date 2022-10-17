const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
  } = process.env;

  const options = {
  };

  const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

  mongoose.connect(url, options).then( function() {
    console.log('MongoDB is connected');
  })
    .catch( function(err) {
    console.log(err);
  });