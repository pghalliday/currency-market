(function() {
  var Withdraw, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Withdraw = require('../../src/Delta/Withdraw');

  describe('Withdraw', function() {
    return it('should instantiate recording the supplied funds', function() {
      var withdraw;

      withdraw = new Withdraw({
        funds: 'hello'
      });
      return withdraw.funds.should.equal('hello');
    });
  });

}).call(this);
