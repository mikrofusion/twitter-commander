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
var twitterCommanderTxt = require("./templates/twitter_commander.txt");

var timeline = require('./timeline/timeline');

var viewManager = require('./view-manager');

viewManager.addCommand('exit', '', 'goodbye', function() { });
viewManager.addCommand('help', 'help <optional command>', 'prompt', function() {});
viewManager.addCommand('timeline', 'timeline <optional user>', 'timeline', function(creds) { return timeline.timeline(creds); });
viewManager.addCommand('tweet', 'tweet <message>', 'prompt', function() {});
viewManager.addCommand('follow', "follow <user>", 'prompt', function() {});
viewManager.addCommand('unfollow', 'unfollow <user>', 'prompt', function() {});

var TwitterCommander = {};

var ioInterface = readline.createInterface(process.stdin, process.stdout);

// TIMELINE VIEW

var TimelineView = require('./timeline/timeline-view');

var timelineView = function(env, data) {
  console.log(TimelineView.formatTweet(data));

  return console.log(chalk.inverse.blue('  n - next.  p - previous.  y - reply.  r - retweet.  f - favorite.  b - back  '));
};

var timelineViewEvents = function(ioInterface, key) {
  ioInterface.clearLine();
  if (key === 'n') { timeline.move(1); }
  if (key === 'p') { timeline.move(-1); }
  if (key === 'b') { return viewManager.setView('prompt'); }
};

viewManager.addView('timeline', timelineView, timelineViewEvents);

var promptView = function(env) {
  return TwitterCommander.setPrompt(env.ioInterface);
};

viewManager.addView('prompt', promptView, function() {});

var goodbyeView = function() {
  console.log('\nbye.');
  return process.exit(0);
};

viewManager.addView('goodbye', goodbyeView, function() {});

TwitterCommander.setPrompt = function(stdinOut) {
  stdinOut.setPrompt(chalk.blue('twitter-commander> '), 19);
  return stdinOut.prompt();
};

TwitterCommander.run = function(creds) {

  var keyStream = Bacon.fromEventTarget(process.stdin, 'keypress');

  viewManager.start(keyStream, ioInterface, creds);

  if (process.stdout.columns < 85) {
    console.log(chalk.red("WARNING: for the best experience use a console wider than 85 characters."));
    console.log('TWITTER COMMANDER');
  } else {
    console.log(twitterCommanderTxt);
  }

  TwitterCommander.setPrompt(ioInterface);
};

module.exports = exports = TwitterCommander;
