chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Book = require '../src/Book'
Order = require '../src/Order'
Amount = require '../src/Amount'

amount5 = new Amount '5'
amount10 = new Amount '10'
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

newOrder = (id, price) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: 'BTC'
    offerCurrency: 'EUR'
    bidAmount: amount100
    bidPrice: price

describe 'Book', ->
  describe '#submit', ->
    it 'should keep track of the order with the highest bid price', ->
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
      book = new Book()
      order1 = newOrder('1', amount50)
      book.submit(order1)
      book.next().should.equal(order1)

      order2 = newOrder('2', amount51)
      book.submit(order2)
      book.next().should.equal(order2)

      order3 = newOrder('3', amount49)
      book.submit(order3)
      book.next().should.equal(order2)

      order4 = newOrder('4', amount52)
      book.submit(order4)
      book.next().should.equal(order4)

      order5 = newOrder('5', amount50Point5)
      book.submit(order5)
      book.next().should.equal(order4)

      order6 = newOrder('6', amount49Point5)
      book.submit(order6)
      book.next().should.equal(order4)

      order7 = newOrder('7', amount48Point5)
      book.submit(order7)
      book.next().should.equal(order4)

      order8 = newOrder('8', amount48Point5) # is equal to but should be placed lower than order 7
      book.submit(order8)
      book.next().should.equal(order4)

      order9 = newOrder('9', amount48Point75)
      book.submit(order9)
      book.next().should.equal(order4)

      order10 = newOrder('10', amount49Point5) # is equal to but should be placed lower than order 6
      book.submit(order10)
      book.next().should.equal(order4)

      order11 = newOrder('11', amount49Point75)
      book.submit(order11)
      book.next().should.equal(order4)

      order12 = newOrder('12', amount50Point5) # is equal to but should be placed lower than order 5
      book.submit(order12)
      book.next().should.equal(order4)

      order13 = newOrder('13', amount50Point75)
      book.submit(order13)
      book.next().should.equal(order4)

      order14 = newOrder('14', amount52) # is equal to but should be placed lower than order 4
      book.submit(order14)
      book.next().should.equal(order4)

      order15 = newOrder('15', amount53)
      book.submit(order15)
      book.next().should.equal(order15)

    describe 'when the order fill event fires', ->
      beforeEach ->
        @book = new Book()
        @order = new Order
          id: '1'
          timestamp: '1'
          account: '123456789'
          offerCurrency: 'EUR'
          bidCurrency: 'BTC'
          bidPrice: amount100
          bidAmount: amount10
        @book.submit @order

      it 'should should delete the order from the book when the amount reaches ZERO', ->
        order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount5
        order.match @order
        @book.next().should.equal @order
        order = new Order
          id: '3'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount10
        order.match @order
        expect(@book.next()).to.not.be.ok

  describe '#cancel', ->
    beforeEach ->
      @book = new Book()
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
      @order1 = newOrder('1', amount50)
      @book.submit(@order1)
      @order2 = newOrder('2', amount51)
      @book.submit(@order2)
      @order3 = newOrder('3', amount49)
      @book.submit(@order3)
      @order4 = newOrder('4', amount52)
      @book.submit(@order4)
      @order5 = newOrder('5', amount50Point5)
      @book.submit(@order5)
      @order6 = newOrder('6', amount49Point5)
      @book.submit(@order6)
      @order7 = newOrder('7', amount48Point5)
      @book.submit(@order7)
      @order8 = newOrder('8', amount48Point5) # is equal to but should be placed lower than order 7
      @book.submit(@order8)
      @order9 = newOrder('9', amount48Point75)
      @book.submit(@order9)
      @order10 = newOrder('10', amount49Point5) # is equal to but should be placed lower than order 6
      @book.submit(@order10)
      @order11 = newOrder('11', amount49Point75)
      @book.submit(@order11)
      @order12 = newOrder('12', amount50Point5) # is equal to but should be placed lower than order 5
      @book.submit(@order12)
      @order13 = newOrder('13', amount50Point75)
      @book.submit(@order13)
      @order14 = newOrder('14', amount52) # is equal to but should be placed lower than order 4
      @book.submit(@order14)
      @order15 = newOrder('15', amount53)
      @book.submit(@order15)

    it 'should keep track of the order with the highest bid price', ->
      @book.cancel(@order1) # cancel head order with both lower and higher orders
      @book.next().should.equal(@order15)
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
      @book.cancel(@order12) # cancel order without higher order
      @book.next().should.equal(@order15)
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
      @book.cancel(@order10) # cancel order on a lower branch with no lower order
      @book.next().should.equal(@order15)
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
      @book.cancel(@order6) # cancel order with no lower order
      @book.next().should.equal(@order15)
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
      @book.cancel(@order11)
      @book.next().should.equal(@order15)
      @book.cancel(@order8)
      @book.next().should.equal(@order15)
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
      @book.cancel(@order15)
      @book.next().should.equal(@order4)
      @book.cancel(@order4)
      @book.next().should.equal(@order14)
      @book.cancel(@order14)
      @book.next().should.equal(@order2)
      @book.cancel(@order2)
      @book.next().should.equal(@order13)
      @book.cancel(@order13)
      @book.next().should.equal(@order5)
      @book.cancel(@order5)
      @book.next().should.equal(@order3)
      @book.cancel(@order3)
      @book.next().should.equal(@order9)
      @book.cancel(@order9)
      @book.next().should.equal(@order7)
      @book.cancel(@order7)
      expect(@book.next()).to.not.be.ok

  describe '#export', ->
    it 'should return a JSON stringifiable array containing a sorted list of orders in the book with the highest first', ->
      book = new Book()
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
      order1 = newOrder('1', amount50)
      book.submit(order1)
      order2 = newOrder('2', amount51)
      book.submit(order2)
      order3 = newOrder('3', amount49)
      book.submit(order3)
      order4 = newOrder('4', amount52)
      book.submit(order4)
      order5 = newOrder('5', amount50Point5)
      book.submit(order5)
      order6 = newOrder('6', amount49Point5)
      book.submit(order6)
      order7 = newOrder('7', amount48Point5)
      book.submit(order7)
      order8 = newOrder('8', amount48Point5) # is equal to but should be placed lower than order 7
      book.submit(order8)
      order9 = newOrder('9', amount48Point75)
      book.submit(order9)
      order10 = newOrder('10', amount49Point5) # is equal to but should be placed lower than order 6
      book.submit(order10)
      order11 = newOrder('11', amount49Point75)
      book.submit(order11)
      order12 = newOrder('12', amount50Point5) # is equal to but should be placed lower than order 5
      book.submit(order12)
      order13 = newOrder('13', amount50Point75)
      book.submit(order13)
      order14 = newOrder('14', amount52) # is equal to but should be placed lower than order 4
      book.submit(order14)
      order15 = newOrder('15', amount53)
      book.submit(order15)
      json = JSON.stringify book.export()
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



