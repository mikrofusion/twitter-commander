var BaconAndEggs = require('bacon-and-eggs');
var Bacon = BaconAndEggs.Bacon;

var Timeline = function() {
  this.init();
};

Timeline.prototype.init = function() {
  this._FETCH_COUNT = 5;
  this._move = new Bacon.Bus();
  this._timelineInput = new Bacon.Bus();
  this._timeline = this._timelineInput.scan([], function(a, b) {
    console.log('============', 'old', a, 'new', b);
    return a.concat(b);
  });
};

Timeline.prototype.move = function(val) {
  this._move.push(val);
};

Timeline.prototype.fetch = function(creds, since_id) {
  var bus = this._timelineInput;

  console.log('fetching..........................');

  BaconAndEggs.toRateLimitedEventStream(
    creds,
    'get',
    'statuses/home_timeline',
    { count: this._FETCH_COUNT, exclude_replies: false, since_id: since_id }
  ).onValue(function(data) {
    console.log('data&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', data);
    bus.push(data);
  });
};

Timeline.prototype.timeline = function(creds) {
  var timelineOffset = this._move.scan(0, function(a, b) { return a + b; });
  var _this = this;

  _this.fetch(creds, 1);
  var test = null;

  return this._timeline.combine(timelineOffset, function(arr, timelineOffset) {
    var offset = Math.max(0, Math.min(timelineOffset, arr.length - 1));

    console.log('----------------------------', arr, 'len', arr[arr.length - 1], timelineOffset);

    if (timelineOffset >= arr.length) {
      console.log('calling ');
      if (timelineOffset === arr.length && timelineOffset !== 0) {
        var lastId = arr[arr.length - 1].id;
        console.log('fetching start', lastId);
        var test = _this.fetch(creds, lastId);
        console.log('fetching end', lastId);
      }
      return null;
    }

    return arr[offset];
  });
};

/* istanbul ignore next  */
if (process.env.NODE_ENV === 'TEST') {
  Timeline.prototype.BaconAndEggs = BaconAndEggs;
  Timeline.prototype.Bacon = Bacon;
}

module.exports = new Timeline();
