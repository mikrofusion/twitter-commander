'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var timeline = require('../lib/timeline/timeline.js');
var Bacon = timeline.Bacon;

describe('timeline', function () {
  var result = undefined;
  var bus = new Bacon.Bus();

  beforeEach(function() {
    sinon.stub(timeline.BaconAndEggs, 'toRateLimitedEventStream', function() {
      return bus;
    });

    timeline.timeline().onValue(function(x) { result = x; });

    bus.push(['foo', 'bar', 'biz', 'baz']);
  });

  afterEach(function() {
    timeline.BaconAndEggs.toRateLimitedEventStream.restore();
  });

  describe('when the timeline has not been moved', function() {
    it('will return the first element returned from the stream', function () {
      expect(result).to.eq('foo');
    });
  });

  describe('when the timeline has been moved one forward', function() {
    beforeEach(function() {
      timeline.move(1);
    });

    it('will return the second element returned from the stream', function () {
      expect(result).to.eq('bar');
    });
  });

  describe('when the timeline has been moved before first item in the array', function() {
    beforeEach(function() {
      timeline.move(-1);
    });

    it('will return the first element returned from the stream', function () {
      expect(result).to.eq('foo');
    });
  });
});
