(function() {
  var Submit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Submit = require('../../src/Operation/Submit');

  describe('Submit', function() {
    it('should error if no bid currency is supplied', function() {
      return expect(function() {
        var submit;

        return submit = new Submit({
          offerCurrency: 'BTC'
        });
      }).to["throw"]('Must supply a bid currency');
    });
    it('should error if no offer currency is supplied', function() {
      return expect(function() {
        var submit;

        return submit = new Submit({
          bidCurrency: 'EUR'
        });
      }).to["throw"]('Must supply an offer currency');
    });
    it('should error if neither a bid or offer price is supplied', function() {
      return expect(function() {
        var submit;

        return submit = new Submit({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC'
        });
      }).to["throw"]('Must supply a bid or offer price');
    });
    describe('with a bid price', function() {
      it('should error if no bid amount is supplied', function() {
        return expect(function() {
          var submit;

          return submit = new Submit({
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            bidPrice: '100'
          });
        }).to["throw"]('Must supply a bid amount with a bid price');
      });
      return it('should instantiate recording the bid currency, offer currency, bid price and bid amount', function() {
        var submit;

        submit = new Submit({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: '100',
          bidAmount: '50'
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.bidPrice.should.equal('100');
        return submit.bidAmount.should.equal('50');
      });
    });
    return describe('with an offer price', function() {
      it('should error if no offer amount is supplied', function() {
        return expect(function() {
          var submit;

          return submit = new Submit({
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: '100'
          });
        }).to["throw"]('Must supply an offer amount with an offer price');
      });
      return it('should instantiate recording the bid currency, offer currency, bid price and bid amount', function() {
        var submit;

        submit = new Submit({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: '100',
          offerAmount: '50'
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.offerPrice.should.equal('100');
        return submit.offerAmount.should.equal('50');
      });
    });
  });

}).call(this);
