(function() {
  var Withdraw, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Withdraw = require('../../src/Operation/Withdraw');

  describe('Withdraw', function() {
    it('should error if no currency is supplied', function() {
      return expect(function() {
        var withdraw;

        return withdraw = new Withdraw({
          amount: '1000'
        });
      }).to["throw"]('Must supply a currency');
    });
    it('should error if no amount is supplied', function() {
      return expect(function() {
        var withdraw;

        return withdraw = new Withdraw({
          currency: 'EUR'
        });
      }).to["throw"]('Must supply an amount');
    });
    return it('should instantiate recording the currency and amount', function() {
      var withdraw;

      withdraw = new Withdraw({
        currency: 'EUR',
        amount: '1000'
      });
      withdraw.currency.should.equal('EUR');
      return withdraw.amount.should.equal('1000');
    });
  });

}).call(this);
