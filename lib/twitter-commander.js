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
var fs = require('fs');
var Mustache = require('mustache');
var chalk = require('chalk');
var gob = require('gob').gob(process.stdout);

require.extensions['.txt'] = function(module, filename) {
  return module.exports = fs.readFileSync(filename, 'utf8');
};

var twitterCommanderTxt = require("./templates/twitter_commander.txt");
var tweetTemplate = require("./templates/tweet.txt");

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
      return TwitterCommander.timeline(
        TwitterCommander.creds,
        TwitterCommander.timelineOffset
      );
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

TwitterCommander.timeSince = function(date) {
  var hours, minutes, months, seconds;
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  seconds = Math.floor((new Date() - date) / 1000);
  minutes = Math.floor(seconds / 60);
  hours = Math.floor(seconds / 3600);
  if (hours < 24 && hours > 1) {
    return hours + "h";
  } else if (minutes < 60 && minutes > 1) {
    return minutes + "m";
  } else if (seconds < 60) {
    return seconds + "s";
  } else {
    return months[date.getMonth()] + " " + (date.getDay());
  }
};

TwitterCommander.printTweet = function(tweet) {
  var retweetUser, t;
  if (tweet == null) {
    return;
  }
  if (tweet.retweeted_status != null) {
    retweetUser = tweet.user;
    t = tweet.retweeted_status;
  } else {
    retweetUser = {};
    t = tweet;
  }
  return Mustache.render(tweetTemplate, {
    retweeted: retweetUser.name != null,
    retweetedByName: retweetUser.name,
    retweetedByScreenName: retweetUser.screen_name,
    name: t.user.name,
    screenName: t.user.screen_name,
    timeSincePost: TwitterCommander.timeSince(new Date(t.created_at)),
    text: t.text,
    retweetCount: t.retweet_count,
    favoriteCount: t.favorite_count
  });
};

TwitterCommander.timelineMove = new Bacon.Bus();

TwitterCommander.timelineOffset = TwitterCommander.timelineMove
  .scan(0, function(a, b) {
    if (a + b >= 0) {
      return a + b;
    } else {
      return 0;
    }
  });

TwitterCommander.timeline = function(creds, timelineOffset) {
  return BaconAndEggs.toRateLimitedEventStream(creds, 'get', 'statuses/home_timeline', {
    count: 20,
    exclude_replies: false,
    since_id: 1
  }).combine(timelineOffset, function(arr, timelineOffset) {
    return TwitterCommander.printTweet(arr[timelineOffset]);
  });
};

console.log(TwitterCommander);

TwitterCommander.run = function(creds) {
  this.creds = creds;
  var rl = readline.createInterface(process.stdin, process.stdout);

  var tweetIndex = new Bacon.Bus();
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
      TwitterCommander.timelineMove.push(1);
    }
    if (x.key === 'p') {
      TwitterCommander.timelineMove.push(-1);
    }
    if (x.key === 'b') {
      return consoleView.push('prompt');
    }
  });

  var timeline = Bacon.fromEventTarget(rl, 'line').flatMap(function(command) {
    if (TwitterCommander.commands[command] != null) {
      consoleView.push(TwitterCommander.commands[command].view);
      return TwitterCommander.commands[command].action(creds);
    } else {
      return Bacon.once(null);
    }
  });

  Bacon.onValues(timeline, consoleView, function(timeline, view) {
    return views[view](timeline);
  });

  consoleView.push('prompt');

  TwitterCommander.timelineMove.push(0);

  Bacon.fromEventTarget(rl, 'close').onValue(function(x) {
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
