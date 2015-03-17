var timeline = require('./timeline');
var TimelineView = require('./timeline-view');
var chalk = require('chalk');

module.exports = function(viewManager) {
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

  viewManager.addCommand('timeline', 'timeline <optional user>', 'timeline', function(creds) { return timeline.timeline(creds); });
  viewManager.addView('timeline', timelineView, timelineViewEvents);
};
