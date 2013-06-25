(function() {
  var Amount, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Amount = require('../../src/Engine/Amount');

  describe('Amount', function() {
    it('cannot be initialized from Javascript Numbers as they are inherently innacurate', function() {
      return expect(function() {
        var amount;
        return amount = new Amount(5);
      }).to["throw"]('Must intialize from string');
    });
    it('cannot be initialized with a string that cannot be parsed to a number', function() {
      return expect(function() {
        var amount;
        return amount = new Amount('This is not a number');
      }).to["throw"]('String initializer cannot be parsed to a number');
    });
    describe('#compareTo', function() {
      it('cannot be called with Javascript Numbers as they are inherently innacurate', function() {
        var amount;
        amount = Amount.ZERO;
        return expect(function() {
          return amount.compareTo(0);
        }).to["throw"]('Can only compare to Amount objects');
      });
      it('should return 0 if 2 amounts are equal', function() {
        var amount1, amount2;
        amount1 = new Amount('5');
        amount2 = new Amount('5');
        return amount1.compareTo(amount2).should.equal(0);
      });
      it('should return -1 if the first amount is less than the second amount', function() {
        var amount1, amount2;
        amount1 = Amount.ZERO;
        amount2 = new Amount('5');
        return amount1.compareTo(amount2).should.equal(-1);
      });
      return it('should return 1 if the first amount is greater than the second amount', function() {
        var amount1, amount2;
        amount1 = new Amount('5');
        amount2 = Amount.ZERO;
        return amount1.compareTo(amount2).should.equal(1);
      });
    });
    describe('#add', function() {
      it('cannot be called with Javascript Numbers as they are inherently innacurate', function() {
        var amount;
        amount = Amount.ZERO;
        return expect(function() {
          return amount.add(5);
        }).to["throw"]('Can only add Amount objects');
      });
      it('should return a new Amount which is the sum of 2 amounts', function() {
        var amount3, amount4, amount7, amountSum, anotherAmount3, anotherAmount4;
        amount3 = new Amount('3');
        amount4 = new Amount('4');
        anotherAmount3 = new Amount('3');
        anotherAmount4 = new Amount('4');
        amount7 = new Amount('7');
        amountSum = amount3.add(amount4);
        amountSum.compareTo(amount7).should.equal(0, 'Sum should be correct');
        amount3.compareTo(anotherAmount3).should.equal(0, 'First amount should not change');
        return amount4.compareTo(anotherAmount4).should.equal(0, 'Second amount should not change');
      });
      return it('should correctly add 0.1 to 0.2 so that we avoid Javascript Number issues', function() {
        var amountPoint1, amountPoint2, amountPoint3, amountSum;
        amountPoint1 = new Amount('0.1');
        amountPoint2 = new Amount('0.2');
        amountPoint3 = new Amount('0.3');
        amountSum = amountPoint1.add(amountPoint2);
        return amountSum.compareTo(amountPoint3).should.equal(0, 'Sum should be correct');
      });
    });
    describe('#subtract', function() {
      it('cannot be called with Javascript Numbers as they are inherently innacurate', function() {
        var amount;
        amount = Amount.ZERO;
        return expect(function() {
          return amount.subtract(5);
        }).to["throw"]('Can only subtract Amount objects');
      });
      return it('should return a new Amount which is the difference of 2 amounts', function() {
        var amount3, amount4, amountDifference, amountMinus1, anotherAmount3, anotherAmount4;
        amount3 = new Amount('3');
        amount4 = new Amount('4');
        anotherAmount3 = new Amount('3');
        anotherAmount4 = new Amount('4');
        amountMinus1 = new Amount('-1');
        amountDifference = amount3.subtract(amount4);
        amountDifference.compareTo(amountMinus1).should.equal(0, 'Difference should be correct');
        amount3.compareTo(anotherAmount3).should.equal(0, 'First amount should not change');
        return amount4.compareTo(anotherAmount4).should.equal(0, 'Second amount should not change');
      });
    });
    describe('#multiply', function() {
      it('cannot be called with Javascript Numbers as they are inherently innacurate', function() {
        var amount;
        amount = Amount.ZERO;
        return expect(function() {
          return amount.multiply(5);
        }).to["throw"]('Can only multiply Amount objects');
      });
      return it('should return a new Amount which is the product of 2 amounts', function() {
        var amount12, amount3, amount4, amountProduct, anotherAmount3, anotherAmount4;
        amount3 = new Amount('3');
        amount4 = new Amount('4');
        anotherAmount3 = new Amount('3');
        anotherAmount4 = new Amount('4');
        amount12 = new Amount('12');
        amountProduct = amount3.multiply(amount4);
        amountProduct.compareTo(amount12).should.equal(0, 'Product should be correct');
        amount3.compareTo(anotherAmount3).should.equal(0, 'First amount should not change');
        return amount4.compareTo(anotherAmount4).should.equal(0, 'Second amount should not change');
      });
    });
    describe('#divide', function() {
      it('cannot be called with Javascript Numbers as they are inherently innacurate', function() {
        var amount;
        amount = Amount.ZERO;
        return expect(function() {
          return amount.divide(5);
        }).to["throw"]('Can only divide Amount objects');
      });
      it('should return a new Amount which is the ratio of 2 amounts', function() {
        var amount3, amount4, amountPoint75, amountRatio, anotherAmount3, anotherAmount4;
        amount3 = new Amount('3');
        amount4 = new Amount('4');
        anotherAmount3 = new Amount('3');
        anotherAmount4 = new Amount('4');
        amountPoint75 = new Amount('0.75');
        amountRatio = amount3.divide(amount4);
        amountRatio.compareTo(amountPoint75).should.equal(0, 'Ratio should be correct');
        amount3.compareTo(anotherAmount3).should.equal(0, 'First amount should not change');
        return amount4.compareTo(anotherAmount4).should.equal(0, 'Second amount should not change');
      });
      it('should divide 1 by 100 and successfully compare to 0.01', function() {
        var amount1, amount100, amountPointZero1, amountRatio;
        amount1 = new Amount('1');
        amount100 = new Amount('100');
        amountPointZero1 = new Amount('0.01');
        amountRatio = amount1.divide(amount100);
        return amountRatio.compareTo(amountPointZero1).should.equal(0);
      });
      return it('should round down to a scale of 25', function() {
        var amount2, amount2Thirds, amount3, amountRatio;
        amount2 = new Amount('2');
        amount3 = new Amount('3');
        amount2Thirds = new Amount('0.6666666666666666666666666');
        amountRatio = amount2.divide(amount3);
        return amountRatio.compareTo(amount2Thirds).should.equal(0);
      });
    });
    describe('#toString', function() {
      it('should return a string representation of the amount', function() {
        var amount;
        amount = new Amount('3.14');
        return amount.toString().should.equal('3.14');
      });
      return it('should retrun a string representation that is suitable for exporting and later importing amounts', function() {
        var amount1, amount2;
        amount1 = new Amount('3.14');
        amount2 = new Amount(amount1.toString());
        return amount1.compareTo(amount2).should.equal(0);
      });
    });
    describe('ZERO', function() {
      return it('should equal zero', function() {
        return Amount.ZERO.compareTo(new Amount('0')).should.equal(0);
      });
    });
    return describe('ONE', function() {
      return it('should equal one', function() {
        return Amount.ONE.compareTo(new Amount('1')).should.equal(0);
      });
    });
  });

}).call(this);
