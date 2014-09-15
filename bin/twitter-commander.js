#!/usr/bin/env node

require('dotenv').load();

var creds = {
  key: process.env.TWITTER_USER_KEY,
  secret: process.env.TWITTER_USER_SECRET,
  token: process.env.TWITTER_USER_TOKEN,
  tokenSecret: process.env.TWITTER_USER_TOKEN_SECRET
};

require('../lib/twitter-commander').run(creds);
