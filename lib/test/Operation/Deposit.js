(function() {
  var Amount, Deposit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Deposit = require('../../src/Operation/Deposit');

  Amount = require('../../src/Amount');

  describe('Deposit', function() {
    it('should error if no currency is supplied', function() {
      return expect(function() {
        var deposit;

        return deposit = new Deposit({
          amount: new Amount('1000')
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
        amount: new Amount('1000')
      });
      deposit.currency.should.equal('EUR');
      deposit.amount.compareTo(new Amount('1000')).should.equal(0);
      deposit = new Deposit({
        exported: JSON.parse(JSON.stringify(deposit))
      });
      deposit.currency.should.equal('EUR');
      return deposit.amount.compareTo(new Amount('1000')).should.equal(0);
    });
  });

}).call(this);
