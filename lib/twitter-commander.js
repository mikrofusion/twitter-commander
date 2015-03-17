/*
 * twitter-commander
 * http://github.com/mikegroseclose/twitter-commander
 *
 * Copyright (c) 2014 Mike Groseclose
 * Licensed under the MIT license.
 */

'use strict';

var BaconAndEggs = require('bacon-and-eggs');
var Bacon = BaconAndEggs.Bacon;
var readline = require('readline');
var chalk = require('chalk');

require("./helpers/template-helpers");

var viewManager = require('./view-manager');

var twitterCommander = {};
var ioInterface = readline.createInterface(process.stdin, process.stdout);

viewManager.addCommand('help', 'help <optional command>', 'prompt', function() {});
viewManager.addCommand('tweet', 'tweet <message>', 'prompt', function() {});
viewManager.addCommand('follow', "follow <user>", 'prompt', function() {});
viewManager.addCommand('unfollow', 'unfollow <user>', 'prompt', function() {});

require('./timeline/timeline-module')(viewManager);
require('./goodbye/goodbye-module')(viewManager);
require('./prompt/prompt-module')(viewManager);

var twitterCommanderTxt = require("./templates/twitter_commander.txt");

twitterCommander.run = function(creds) {
  if (process.stdout.columns < 85) {
    console.log(chalk.red("WARNING: for the best experience use a console wider than 85 characters."));
    console.log('TWITTER COMMANDER');
  } else {
    console.log(twitterCommanderTxt);
  }

  var keyStream = Bacon.fromEventTarget(process.stdin, 'keypress');
  viewManager.start(keyStream, ioInterface, creds);
};

module.exports = exports = twitterCommander;
