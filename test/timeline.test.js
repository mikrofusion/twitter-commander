'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var Timeline = require('../lib/timeline.js');

var Bacon = Timeline.Bacon;

describe('timeline', function () {
  var result;
  var timeline;
  var bus = new Bacon.Bus();

  beforeEach(function() {
    sinon.stub(Timeline.BaconAndEggs, 'toRateLimitedEventStream', function() {
      return bus;
    });

    timeline = new Timeline({});
    timeline.timeline().onValue(function(x) { result = x; });

    bus.push(['foo', 'bar', 'biz', 'baz']);
  });

  afterEach(function() {
    Timeline.BaconAndEggs.toRateLimitedEventStream.restore();
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
