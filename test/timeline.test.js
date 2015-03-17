'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var timeline = require('../lib/timeline/timeline.js');
var Bacon = timeline.Bacon;

describe('timeline', function () {
  var result = undefined;
  var queryCount = 0;
  var bus1 = undefined;
  var bus2 = undefined;
  var stub = undefined;

  beforeEach(function() {
    timeline.init();

    queryCount = 0;
    bus1 = new Bacon.Bus();
    bus2 = new Bacon.Bus();

    stub = sinon.stub(timeline.BaconAndEggs, 'toRateLimitedEventStream', function(args) {
      if (queryCount === 0) {
        console.log('bus1');
        queryCount++;
        return bus1;
      } else {
        console.log('bus2');
        return bus2;
      }
    });

    timeline.timeline().onValue(function(x) {
      console.log('result', x);
      result = x;
    });

    bus1.push([{id: 1}, {id: 2}, {id: 3}]);
    bus2.push([{id: 4}]);
  });

  afterEach(function() {
    timeline.BaconAndEggs.toRateLimitedEventStream.restore();
  });

  describe('when the timeline has not been moved', function() {
    it('will return the first element returned from the stream', function () {
      expect(result).to.deep.eq({id: 1});
    });
  });

  describe('when the timeline has been moved before first item in the array', function() {
    beforeEach(function() {
      timeline.move(-1);
    });

    it('will return the first element returned from the stream', function () {
      expect(result).to.deep.eq({id: 1});
    });
  });

  describe('when the timeline has been moved one forward', function() {
    beforeEach(function() {
      timeline.move(1);
    });

    it('will return the second element returned from the stream', function () {
      expect(result).to.deep.eq({id: 2});
    });
  });

  describe('when the timeline has been moved to the end', function() {
    it('will fetch the next set of data in the timeline', function () {
      expect(result).to.eq(null);
      expect(stub.lastCall.args[3].since_id).to.eq(3);
      timeline.move(1);
    });
  });
});
