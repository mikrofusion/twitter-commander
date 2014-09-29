var BaconAndEggs = require('bacon-and-eggs');
var Bacon = BaconAndEggs.Bacon;

var Timeline = function(creds) {
  this._move = new Bacon.Bus();
  this._stream = BaconAndEggs.toRateLimitedEventStream(
    creds,
    'get',
    'statuses/home_timeline',
    { count: 20, exclude_replies: false, since_id: 1 }
  );
};

Timeline.prototype.move = function(val) {
  this._move.push(val);
};

Timeline.prototype.timeline = function() {
  var timelineOffset = this._move.scan(0, function(a, b) {
    if (a + b >= 0) { return a + b; } else { return 0; }
  });

  return this._stream.combine(timelineOffset, function(arr, timelineOffset) {
    return arr[timelineOffset];
  });
};

/* istanbul ignore next  */
if (process.env.NODE_ENV === 'TEST') {
  Timeline.BaconAndEggs = BaconAndEggs;
  Timeline.Bacon = Bacon;
}

module.exports = Timeline;
