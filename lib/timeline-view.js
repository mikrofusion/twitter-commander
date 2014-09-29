var Mustache = require('mustache');

var TimelineView = function() {};

require("./helpers/template-helpers");
TimelineView.prototype.tweetTemplate = require("./templates/tweet.txt");

TimelineView.prototype.timeSince = function(dateCreated, now) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var seconds = Math.floor((now - dateCreated) / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(seconds / 3600);

  if (hours < 24 && hours >= 1) {
    return hours + "h";
  } else if (minutes < 60 && minutes >= 1) {
    return minutes + "m";
  } else if (seconds < 60) {
    return seconds + "s";
  } else {
    return months[dateCreated.getMonth()] + " " + (dateCreated.getDate());
  }
};

TimelineView.prototype.printTweet = function(tweet, now) {
  var retweetUser, t;

  if (tweet == null) {
    return null;
  }

  if (tweet.retweeted_status != null) {
    retweetUser = tweet.user;
    t = tweet.retweeted_status;
  } else {
    retweetUser = {};
    t = tweet;
  }

  return Mustache.render(this.tweetTemplate, {
    retweeted: retweetUser.name != null,
    retweetedByName: retweetUser.name,
    retweetedByScreenName: retweetUser.screen_name,
    name: t.user.name,
    screenName: t.user.screen_name,
    timeSincePost: this.timeSince(new Date(t.created_at), now),
    text: t.text,
    retweetCount: t.retweet_count,
    favoriteCount: t.favorite_count
  });

};

module.exports = new TimelineView();
