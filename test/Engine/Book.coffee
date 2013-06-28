chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Book = require '../../src/Engine/Book'
Order = require '../../src/Engine/Order'
Amount = require '../../src/Amount'
Account = require '../../src/Engine/Account'

amountPoint05 = new Amount '0.05'
amountPoint1 = new Amount '0.1'
amount5 = new Amount '5'
amount10 = new Amount '10'
amount15 = new Amount '15'
amount48Point5 = new Amount '48.5'
amount48Point75 = new Amount '48.75'
amount49 = new Amount '49'
amount49Point5 = new Amount '49.5'
amount49Point75 = new Amount '49.75'
amount50 = new Amount '50'
amount50Point5 = new Amount '50.5'
amount50Point75 = new Amount '50.75'
amount51 = new Amount '51'
amount52 = new Amount '52'
amount53 = new Amount '53'
amount100 = new Amount '100'
amount1000 = new Amount '1000'

describe 'Book', ->
  beforeEach ->
    sequence = 0
    timestamp = 1371737390976

    @book = new Book
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      
    @account = new Account
      id: 'Peter'

    @newBid = (price) =>
      new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @account
        book: @book
        bidPrice: price
        bidAmount: amount50

    @newOffer = (price) =>
      new Order
        sequence: sequence++
        timestamp: timestamp++
        account: @account
        book: @book
        offerPrice: price
        offerAmount: amount50

  it 'should error if no bid currency is supplied', ->
    expect ->
      book = new Book
        offerCurrency: 'EUR'
    .to.throw 'Must supply a bid currency'

  it 'should error if no offer currency is supplied', ->
    expect ->
      book = new Book
        bidCurrency: 'BTC'
    .to.throw 'Must supply an offer currency'

  describe '#submit', ->
    it 'should keep track of the order with the highest bid price and return the sequence of the next higher order or undefined if it is the highest', ->
      #
      #                       1
      #                      / \
      #                     /   \
      #                    /     \
      #                   /       \
      #                  /         \
      #                 3           2
      #                / \         / \
      #               /   \       /   \
      #              7     6     5     4
      #             / \   / \   / \   / \
      #            8   9 10 11 12 13 14 15
      #
      order1 = @newBid amount50
      nextHigher = @book.submit order1
      @book.next().should.equal order1
      expect(nextHigher).to.not.be.ok

      order2 = @newBid amount51
      nextHigher = @book.submit order2
      @book.next().should.equal order2
      expect(nextHigher).to.not.be.ok

      order3 = @newBid amount49
      nextHigher = @book.submit order3
      @book.next().should.equal order2
      nextHigher.should.equal order1

      order4 = @newBid amount52
      nextHigher = @book.submit order4
      @book.next().should.equal order4
      expect(nextHigher).to.not.be.ok

      order5 = @newBid amount50Point5
      nextHigher = @book.submit order5
      @book.next().should.equal order4
      nextHigher.should.equal order2

      order6 = @newBid amount49Point5
      nextHigher = @book.submit order6
      @book.next().should.equal order4
      nextHigher.should.equal order1

      order7 = @newBid amount48Point5
      nextHigher = @book.submit order7
      @book.next().should.equal order4
      nextHigher.should.equal order3

      order8 = @newBid amount48Point5 # is equal to but should be placed lower than order 7
      nextHigher = @book.submit order8
      @book.next().should.equal order4
      nextHigher.should.equal order7

      order9 = @newBid amount48Point75
      nextHigher = @book.submit order9
      @book.next().should.equal order4
      nextHigher.should.equal order3

      order10 = @newBid amount49Point5 # is equal to but should be placed lower than order 6
      nextHigher = @book.submit order10
      @book.next().should.equal order4
      nextHigher.should.equal order6

      order11 = @newBid amount49Point75
      nextHigher = @book.submit order11
      @book.next().should.equal order4
      nextHigher.should.equal order1

      order12 = @newBid amount50Point5 # is equal to but should be placed lower than order 5
      nextHigher = @book.submit order12
      @book.next().should.equal order4
      nextHigher.should.equal order5

      order13 = @newBid amount50Point75
      nextHigher = @book.submit order13
      @book.next().should.equal order4
      nextHigher.should.equal order2

      order14 = @newBid amount52 # is equal to but should be placed lower than order 4
      nextHigher = @book.submit order14
      @book.next().should.equal order4
      nextHigher.should.equal order4

      order15 = @newBid amount53
      nextHigher = @book.submit order15
      @book.next().should.equal order15
      expect(nextHigher).to.not.be.ok

    it 'should handle bids and offers in the same book', ->
      @book.submit @newBid amount10
      @book.submit @newOffer amountPoint05
      @book.submit @newBid amount10

  describe '#cancel', ->
    beforeEach ->
      #
      #                       1
      #                      / \
      #                     /   \
      #                    /     \
      #                   /       \
      #                  /         \
      #                 3           2
      #                / \         / \
      #               /   \       /   \
      #              7     6     5     4
      #             / \   / \   / \   / \
      #            8   9 10 11 12 13 14 15
      #
      @order1 = @newBid amount50
      @book.submit @order1
      @order2 = @newBid amount51
      @book.submit @order2
      @order3 = @newBid amount49
      @book.submit @order3
      @order4 = @newBid amount52
      @book.submit @order4
      @order5 = @newBid amount50Point5
      @book.submit @order5
      @order6 = @newBid amount49Point5
      @book.submit @order6
      @order7 = @newBid amount48Point5
      @book.submit @order7
      @order8 = @newBid amount48Point5 # is equal to but should be placed lower than order 7
      @book.submit @order8
      @order9 = @newBid amount48Point75
      @book.submit @order9
      @order10 = @newBid amount49Point5 # is equal to but should be placed lower than order 6
      @book.submit @order10
      @order11 = @newBid amount49Point75
      @book.submit @order11
      @order12 = @newBid amount50Point5 # is equal to but should be placed lower than order 5
      @book.submit @order12
      @order13 = @newBid amount50Point75
      @book.submit @order13
      @order14 = @newBid amount52 # is equal to but should be placed lower than order 4
      @book.submit @order14
      @order15 = @newBid amount53
      @book.submit @order15

    it 'should keep track of the order with the highest bid price', ->
      @book.cancel @order1 # cancel head order with both lower and higher orders
      @book.next().should.equal @order15
      #                         2
      #                        / \
      #                       /   \
      #                      5     4
      #                     / \   / \
      #                    12 13 14 15
      #                   /  
      #                  3   
      #                 / \  
      #                /   \ 
      #               7     6 
      #              / \   / \ 
      #             8   9 10 11
      @book.cancel @order12 # cancel order without higher order
      @book.next().should.equal @order15
      #                         2
      #                        / \
      #                       /   \
      #                      5     4
      #                     / \   / \
      #                    3  13 14 15
      #                   / \  
      #                  /   \ 
      #                 7     6 
      #                / \   / \ 
      #               8   9 10 11
      @book.cancel @order10  # cancel order on a lower branch with no lower order
      @book.next().should.equal @order15
      #                         2
      #                        / \
      #                       /   \
      #                      5     4
      #                     / \   / \
      #                    3  13 14 15
      #                   / \  
      #                  /   \ 
      #                 7     6 
      #                / \     \ 
      #               8   9    11
      @book.cancel @order6 # cancel order with no lower order
      @book.next().should.equal @order15
      #                         2
      #                        / \
      #                       /   \
      #                      5     4
      #                     / \   / \
      #                    3  13 14 15
      #                   / \  
      #                  /   \ 
      #                 7    11
      #                / \    
      #               8   9   
      @book.cancel @order11
      @book.next().should.equal @order15
      @book.cancel @order8
      @book.next().should.equal @order15
      #                         2
      #                        / \
      #                       /   \
      #                      5     4
      #                     / \   / \
      #                    3  13 14 15
      #                   /   
      #                  /   
      #                 7   
      #                  \    
      #                   9   
      #
      # Now remove highest until all elements have been removed and verify the new highest each time
      # this time we'll use the actual references submited as this should also be safe
      @book.cancel @order15
      @book.next().should.equal @order4
      @book.cancel @order4
      @book.next().should.equal @order14
      @book.cancel @order14
      @book.next().should.equal @order2
      @book.cancel @order2
      @book.next().should.equal @order13
      @book.cancel @order13
      @book.next().should.equal @order5
      @book.cancel @order5
      @book.next().should.equal @order3
      @book.cancel @order3
      @book.next().should.equal @order9
      @book.cancel @order9
      @book.next().should.equal @order7
      @book.cancel @order7
      expect(@book.next()).to.not.be.ok

  describe '#export', ->
    it 'should return a JSON stringifiable array containing a sorted list of orders in the book with the highest first', ->
      #
      #                       1
      #                      / \
      #                     /   \
      #                    /     \
      #                   /       \
      #                  /         \
      #                 3           2
      #                / \         / \
      #               /   \       /   \
      #              7     6     5     4
      #             / \   / \   / \   / \
      #            8   9 10 11 12 13 14 15
      #
      order1 = @newBid amount50
      @book.submit order1
      order2 = @newBid amount51
      @book.submit order2
      order3 = @newBid amount49
      @book.submit order3
      order4 = @newBid amount52
      @book.submit order4
      order5 = @newBid amount50Point5
      @book.submit order5
      order6 = @newBid amount49Point5
      @book.submit order6
      order7 = @newBid amount48Point5
      @book.submit order7
      order8 = @newBid amount48Point5 # is equal to but should be placed lower than order 7
      @book.submit order8
      order9 = @newBid amount48Point75
      @book.submit order9
      order10 = @newBid amount49Point5 # is equal to but should be placed lower than order 6
      @book.submit order10
      order11 = @newBid amount49Point75
      @book.submit order11
      order12 = @newBid amount50Point5 # is equal to but should be placed lower than order 5
      @book.submit order12
      order13 = @newBid amount50Point75
      @book.submit order13
      order14 = @newBid amount52 # is equal to but should be placed lower than order 4
      @book.submit order14
      order15 = @newBid amount53
      @book.submit order15
      json = JSON.stringify @book.export()
      array = JSON.parse json
      array.should.deep.equal [
        order15.export()
        order4.export()
        order14.export()
        order2.export()
        order13.export()
        order5.export()
        order12.export()
        order1.export()
        order11.export()
        order6.export()
        order10.export()
        order3.export()
        order9.export()
        order7.export()
        order8.export()
      ]



