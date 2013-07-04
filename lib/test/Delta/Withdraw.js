(function() {
  var Amount, Withdraw, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Withdraw = require('../../src/Delta/Withdraw');

  Amount = require('../../src/Amount');

  describe('Withdraw', function() {
    return it('should instantiate recording the supplied funds', function() {
      var withdraw;

      withdraw = new Withdraw({
        funds: new Amount('500')
      });
      withdraw.funds.compareTo(new Amount('500')).should.equal(0);
      withdraw = new Withdraw({
        exported: JSON.parse(JSON.stringify(withdraw))
      });
      return withdraw.funds.compareTo(new Amount('500')).should.equal(0);
    });
  });

}).call(this);
