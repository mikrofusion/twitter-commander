'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var timelineView = require('../lib/timeline-view.js');

describe('timelineView', function() {
  describe('timeSince', function() {
    describe('when the date created and now are less than a minute appart', function() {
      it('will return the month and day of the date created', function() {
        var result = timelineView.timeSince(new Date(2014, 1, 1, 0, 0, 0), new Date(2014, 1, 1, 0, 0, 15));
        expect(result).to.eq('15s');
      });
    });

    describe('when the date created and now are less than a hour appart', function() {
      it('will return the month and day of the date created', function() {
        var result = timelineView.timeSince(new Date(2014, 1, 1, 0, 0, 0), new Date(2014, 1, 1, 0, 4, 15));
        expect(result).to.eq('4m');
      });
    });

    describe('when the date created and now are less than a day appart', function() {
      it('will return the month and day of the date created', function() {
        var result = timelineView.timeSince(new Date(2014, 1, 1, 0, 0, 0), new Date(2014, 1, 1, 5, 4, 15));
        expect(result).to.eq('5h');
      });
    });

    describe('when the date created and now are greater than a day appart', function() {
      it('will return the month and day of the date created', function() {
        var result = timelineView.timeSince(new Date(2014, 1, 1, 0, 0, 0), new Date(2014, 2, 1, 0, 0, 0));
        expect(result).to.eq('Feb 1');
      });
    });
  });

  describe('printTweet', function() {
    describe('given an invalid (null) tweet', function() {
      it('returns null', function() {
        var tweet = null;
        var now = null;
        var result = timelineView.printTweet(tweet, now);
        expect(result).to.eq(null);
      });
    });

    describe('given a valid tweet and time', function() {
      describe('given a tweet', function() {
        var tweet, now, result;

        before(function() {
          tweet = {
            created_at: "Jan 1, 2014",
            user: {
              name: 'foo name',
              screen_name: 'foobar'
            },
            text: 'This is a tweet.',
            retweet_count: 0,
            favorite_count: 13
          };
          now = new Date(2014, 5, 4, 3, 2, 1);
          result = timelineView.printTweet(tweet, now);
        });

        it('does not contain retweet info', function() {
          expect(result).to.not.contain('Retweeted by');
        });

        it('contains the users name', function() {
          expect(result).to.contain('foo name');
        });

        it('contains the created users screenname', function() {
          expect(result).to.contain('@foobar');
        });

        it('contains the created at date', function() {
          expect(result).to.contain('Jan 1');
        });

        it('contains the tweet text', function() {
          expect(result).to.contain('This is a tweet.');
        });

        it('contains the retweet count', function() {
          expect(result).to.contain('0 retweets.');
        });

        it('contains the favorite count', function() {
          expect(result).to.contain('13 favorites.');
        });
      });

      describe('given a retweet', function() {
        var tweet, now, result;

        before(function() {
          tweet = {
            user: {
              name: 'biz name',
              screen_name: 'bizbaz'
            },
            retweeted_status: {
              user: {
                name: 'foo name',
                screen_name: 'foobar'
              },
              created_at: "Jan 1, 2014",
              text: 'This is a tweet.',
              retweet_count: 5,
              favorite_count: 13
            }
          };
          now = new Date(2014, 5, 4, 3, 2, 1);
          result = timelineView.printTweet(tweet, now);
        });

        it('contains the retweet info', function() {
          expect(result).to.contain('Retweeted by biz name (@bizbaz)');
        });

        it('contains the users name', function() {
          expect(result).to.contain('foo name');
        });

        it('contains the created users screenname', function() {
          expect(result).to.contain('@foobar');
        });

        it('contains the created at date', function() {
          expect(result).to.contain('Jan 1');
        });

        it('contains the tweet text', function() {
          expect(result).to.contain('This is a tweet.');
        });

        it('contains the retweet count', function() {
          expect(result).to.contain('5 retweets.');
        });

        it('contains the favorite count', function() {
          expect(result).to.contain('13 favorites.');
        });
      });

    });
  });
});
