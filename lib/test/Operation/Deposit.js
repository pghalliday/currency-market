(function() {
  var Deposit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Deposit = require('../../src/Operation/Deposit');

  describe('Deposit', function() {
    it('should error if no currency is supplied', function() {
      return expect(function() {
        var deposit;

        return deposit = new Deposit({
          amount: '1000'
        });
      }).to["throw"]('Must supply a currency');
    });
    it('should error if no amount is supplied', function() {
      return expect(function() {
        var deposit;

        return deposit = new Deposit({
          currency: 'EUR'
        });
      }).to["throw"]('Must supply an amount');
    });
    return it('should instantiate recording the currency and amount', function() {
      var deposit;

      deposit = new Deposit({
        currency: 'EUR',
        amount: '1000'
      });
      deposit.currency.should.equal('EUR');
      return deposit.amount.should.equal('1000');
    });
  });

}).call(this);
