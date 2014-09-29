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
var gob = require('gob').gob(process.stdout);

require("./helpers/template-helpers");
var twitterCommanderTxt = require("./templates/twitter_commander.txt");

var timeline = require('./timeline');

//var completer = function(linePartial, callback) {
  //return callback(null, [['123', '456'], linePartial]);
//};
//var rl = readline.createInterface(process.stdin, process.stdout, completer);

var TwitterCommander = {};

TwitterCommander.commands = {
  clear: {
    view: 'prompt',
    action: function() {
      return gob.vanish();
    }
  },
  help: {
    description: 'help <optional command>',
    view: 'prompt',
    action: function() {}
  },
  timeline: {
    description: 'timeline <optional user>',
    view: 'timeline',
    action: function() {
      timeline.timeline(TwitterCommander.creds);
    }
  },
  tweet: {
    description: "tweet <message>",
    view: 'prompt',
    action: function() {}
  },
  follow: {
    description: "follow <user>",
    view: 'prompt',
    action: function() {}
  },
  unfollow: {
    description: "unfollow <user>",
    view: 'prompt',
    action: function() {}
  }
};

TwitterCommander.run = function(creds) {
  this.creds = creds;
  var rl = readline.createInterface(process.stdin, process.stdout);

  var consoleView = new Bacon.Bus();

  Bacon.fromEventTarget(process.stdin, 'keypress').combine(consoleView, function(key, consoleView) {
    return {
      key: key,
      consoleView: consoleView
    };
  }).filter(function(x) {
    return x.consoleView === 'timeline';
  }).onValue(function(x) {
    rl.clearLine();
    if (x.key === 'n') {
      timeline.move(1);
    }
    if (x.key === 'p') {
      timeline.move(-1);
    }
    if (x.key === 'b') {
      return consoleView.push('prompt');
    }
  });

  var timelineView = Bacon.fromEventTarget(rl, 'line').flatMap(function(command) {
    if (TwitterCommander.commands[command] != null) {
      consoleView.push(TwitterCommander.commands[command].view);
      return TwitterCommander.commands[command].action(creds);
    } else {
      return Bacon.once(null);
    }
  });

  Bacon.onValues(timelineView, consoleView, function(timeline, view) {
    return views[view](timeline);
  });

  consoleView.push('prompt');

  timeline.move(0);

  Bacon.fromEventTarget(rl, 'close').onValue(function() {
    console.log('\nbye.');
    return process.exit(0);
  });

  ////////////////////////////////////////////////////////////////////////

  var twitterCommander = function() {
    if (process.stdout.columns < 85) {
      console.log(chalk.red("WARNING: for the best experience use a console wider than 85 characters."));
      console.log('TWITTER COMMANDER');
    } else {
      console.log(twitterCommanderTxt);
    }
    return gob.set();
  };

  twitterCommander();

  var setPrompt = function() {
    rl.setPrompt(chalk.blue('twitter-commander> '), 19);
    return rl.prompt();
  };

  setPrompt();

  var views = {
    timeline: function(data) {
      gob.vanish();
      console.log(data);
      return console.log(chalk.inverse.blue('  n - next.  p - previous.  y - reply.  r - retweet.  f - favorite.  b - back  '));
    },
    prompt: function() {
      return setPrompt();
    }
  };
};

module.exports = exports = TwitterCommander;
