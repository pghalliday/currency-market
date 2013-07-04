(function() {
  var Deposit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Deposit = require('../../src/Delta/Deposit');

  describe('Deposit', function() {
    return it('should instantiate recording the supplied funds', function() {
      var deposit;

      deposit = new Deposit({
        funds: 'hello'
      });
      return deposit.funds.should.equal('hello');
    });
  });

}).call(this);
