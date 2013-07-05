(function() {
  var Amount, Submit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Submit = require('../../src/Delta/Submit');

  Amount = require('../../src/Amount');

  describe('Submit', function() {
    return it('should instantiate recording the supplied locked funds, next higher order sequence and trades', function() {
      var submit, trades;
      trades = [
        {
          left: {
            remainder: {
              bidAmount: new Amount('12589.1335'),
              offerAmount: new Amount('3261.23')
            },
            transaction: {
              debit: {
                amount: new Amount('6592.32697'),
                funds: new Amount('123498.132455'),
                lockedFunds: new Amount('38529.21558')
              },
              credit: {
                amount: new Amount('326598.2356'),
                funds: new Amount('65489123.53658'),
                commission: {
                  amount: new Amount('326.123588'),
                  funds: new Amount('456432148131.45645645'),
                  reference: '0.01%'
                }
              }
            }
          },
          right: {
            transaction: {
              debit: {
                amount: new Amount('6592.32697'),
                funds: new Amount('123498.132455'),
                lockedFunds: new Amount('38529.21558')
              },
              credit: {
                amount: new Amount('326598.2356'),
                funds: new Amount('65489123.53658'),
                commission: {
                  amount: new Amount('326.123588'),
                  funds: new Amount('456432148131.45645645'),
                  reference: '0.01%'
                }
              }
            }
          }
        }, {
          left: {
            transaction: {
              debit: {
                amount: new Amount('6592.32697'),
                funds: new Amount('123498.132455'),
                lockedFunds: new Amount('38529.21558')
              },
              credit: {
                amount: new Amount('326598.2356'),
                funds: new Amount('65489123.53658'),
                commission: {
                  amount: new Amount('326.123588'),
                  funds: new Amount('456432148131.45645645'),
                  reference: '0.01%'
                }
              }
            }
          },
          right: {
            remainder: {
              bidAmount: new Amount('12589.1335'),
              offerAmount: new Amount('3261.23')
            },
            transaction: {
              debit: {
                amount: new Amount('6592.32697'),
                funds: new Amount('123498.132455'),
                lockedFunds: new Amount('38529.21558')
              },
              credit: {
                amount: new Amount('326598.2356'),
                funds: new Amount('65489123.53658'),
                commission: {
                  amount: new Amount('326.123588'),
                  funds: new Amount('456432148131.45645645'),
                  reference: '0.01%'
                }
              }
            }
          }
        }
      ];
      submit = new Submit({
        lockedFunds: new Amount('1100'),
        nextHigherOrderSequence: 0,
        trades: trades
      });
      submit.lockedFunds.compareTo(new Amount('1100')).should.equal(0);
      submit.nextHigherOrderSequence.should.equal(0);
      submit.trades.should.deep.equal(trades);
      submit = new Submit({
        exported: JSON.parse(JSON.stringify(submit))
      });
      submit.lockedFunds.compareTo(new Amount('1100')).should.equal(0);
      submit.nextHigherOrderSequence.should.equal(0);
      trades = submit.trades;
      trades.should.have.length(2);
      trades[0].left.remainder.bidAmount.compareTo(new Amount('12589.1335')).should.equal(0);
      return trades[1].right.transaction.credit.commission.funds.compareTo(new Amount('456432148131.45645645')).should.equal(0);
    });
  });

}).call(this);
