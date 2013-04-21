Book = require('../../src/Market/Book')
Order = require('../../src/Market/Order')
BigDecimal = require('BigDecimal').BigDecimal

newOrder = (id, amount, price) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name',
    bidCurrency: 'BTC',
    offerCurrency: 'EUR',
    bidAmount: amount,
    bidPrice: price

describe 'Book', ->
  it 'should instantiate with a collection of orders', ->
    book = new Book()
    Object.keys(book.orders).should.be.empty

  describe '#addOrder', ->
    it 'should add the order to the collection of orders', ->
      book = new Book()
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      book.addOrder(order)
      book.orders[order.id].should.equal(order)

    it 'should build a binary tree of orders sorted by price and keep track of the order with the highest bid price', ->
      book = new Book()
      order1 = newOrder('1', '100', '50')
      book.addOrder(order1)
      order2 = newOrder('2', '100', '51')
      book.addOrder(order2)
      order3 = newOrder('3', '100', '49')
      book.addOrder(order3)
      order4 = newOrder('4', '100', '50')
      book.addOrder(order4)
      order5 = newOrder('5', '100', '51')
      book.addOrder(order5)
      order6 = newOrder('6', '100', '52')
      book.addOrder(order6)
      order7 = newOrder('7', '100', '51')
      book.addOrder(order7)
      order8 = newOrder('8', '100', '52')
      book.addOrder(order8)
      book.head.should.equal(order1)
      book.head.higher.should.equal(order2)
      book.head.lower.should.equal(order3)
      book.head.lower.higher.should.equal(order4)
      book.head.higher.lower.should.equal(order5)
      book.head.higher.higher.should.equal(order6)
      book.head.higher.lower.lower.should.equal(order7)
      book.head.higher.higher.lower.should.equal(order8)
      book.highest.should.equal(order6)

  describe '#deleteOrder', ->
    it 'should throw an error if the order ID cannot be found', ->
      book = new Book()
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      expect ->
        book.deleteOrder(order)
      .to.throw('Order cannot be found')

    it 'should throw an error if the order does not match', ->
      book = new Book()
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      book.addOrder(order)
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'another name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      expect ->
        book.deleteOrder(order)
      .to.throw('Orders do not match')

    it 'should remove the order from the collection of orders', ->
      book = new Book()
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      book.addOrder(order)
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
        offerAmount: '50'
      book.deleteOrder(order)
      expect(book.orders[order.id]).to.not.be.ok

    it 'should maintain the binary tree of orders and keep track of the order with the highest bid price', ->
      book = new Book()
      order1 = newOrder('1', '100', '50')
      book.addOrder(order1)
      order2 = newOrder('2', '100', '51')
      book.addOrder(order2)
      order3 = newOrder('3', '100', '49')
      book.addOrder(order3)
      order4 = newOrder('4', '100', '50')
      book.addOrder(order4)
      order5 = newOrder('5', '100', '51')
      book.addOrder(order5)
      order6 = newOrder('6', '100', '52')
      book.addOrder(order6)
      order7 = newOrder('7', '100', '51')
      book.addOrder(order7)
      order8 = newOrder('8', '100', '52')
      book.addOrder(order8)
      book.head.should.equal(order1)
      book.head.higher.should.equal(order2)
      book.head.lower.should.equal(order3)
      book.head.lower.higher.should.equal(order4)
      book.head.higher.lower.should.equal(order5)
      book.head.higher.higher.should.equal(order6)
      book.head.higher.lower.lower.should.equal(order7)
      book.head.higher.higher.lower.should.equal(order8)
      book.highest.should.equal(order6)
      book.deleteOrder(order8)
      expect(book.head.higher.higher.lower).to.not.be.ok
      book.highest.should.equal(order6)
      book.deleteOrder(order1)
      book.head.should.equal(order2)
      book.head.lower.should.equal(order5)
      book.head.lower.lower.should.equal(order7)
      book.head.lower.lower.lower.should.equal(order3)
      book.head.lower.lower.lower.higher.should.equal(order4)
      book.head.higher.should.equal(order6)
      book.highest.should.equal(order6)
      book.deleteOrder(order6)
      book.head.should.equal(order2)
      book.head.lower.should.equal(order5)
      book.head.lower.lower.should.equal(order7)
      book.head.lower.lower.lower.should.equal(order3)
      book.head.lower.lower.lower.higher.should.equal(order4)
      book.highest.should.equal(order2)
      # TODO: need more delete tests (probably time to get the coverage tool out)
