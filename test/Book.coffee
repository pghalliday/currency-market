Book = require('../src/Book')

describe 'Book', ->
  it 'should instantiate with a collection of orders', ->
    book = new Book()
    Object.keys(book.orders).should.be.empty
