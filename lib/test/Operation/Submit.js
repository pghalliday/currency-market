(function() {
  var Amount, Submit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Submit = require('../../src/Operation/Submit');

  Amount = require('../../src/Amount');

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
            bidPrice: new Amount('100')
          });
        }).to["throw"]('Must supply a bid amount with a bid price');
      });
      return it('should instantiate recording the bid currency, offer currency, bid price and bid amount', function() {
        var submit;
        submit = new Submit({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('50')
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.bidPrice.compareTo(new Amount('100')).should.equal(0);
        submit.bidAmount.compareTo(new Amount('50')).should.equal(0);
        submit = new Submit({
          exported: JSON.parse(JSON.stringify(submit))
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.bidPrice.compareTo(new Amount('100')).should.equal(0);
        return submit.bidAmount.compareTo(new Amount('50')).should.equal(0);
      });
    });
    return describe('with an offer price', function() {
      it('should error if no offer amount is supplied', function() {
        return expect(function() {
          var submit;
          return submit = new Submit({
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: new Amount('100')
          });
        }).to["throw"]('Must supply an offer amount with an offer price');
      });
      return it('should instantiate recording the bid currency, offer currency, bid price and bid amount', function() {
        var submit;
        submit = new Submit({
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('100'),
          offerAmount: new Amount('50')
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.offerPrice.compareTo(new Amount('100')).should.equal(0);
        submit.offerAmount.compareTo(new Amount('50')).should.equal(0);
        submit = new Submit({
          exported: JSON.parse(JSON.stringify(submit))
        });
        submit.bidCurrency.should.equal('EUR');
        submit.offerCurrency.should.equal('BTC');
        submit.offerPrice.compareTo(new Amount('100')).should.equal(0);
        return submit.offerAmount.compareTo(new Amount('50')).should.equal(0);
      });
    });
  });

}).call(this);
