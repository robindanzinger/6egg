const { expect } = require('chai')
const { parse } = require('../../src/modelparser')
const { createAllResolver } = require('../../src/converter/gqlresolver')

const begg = `
Book
  _id id!
  title string!
  author Author! ref 

Author
  _id id!
  name string
  books [Book!]! ref -oppositeidfield author
  favouriteBook Book ref
`

describe('gql resolver generator', () => {
  it('creates resolvers for simple 6egg model', () => {
    const beggmodel = parse(begg)
    const expected = `\
{
Book: {
author(parent, arg, {dataSources}) {
  return dataSources.Author.findById(parent.author._id)
}
},
Author: {
books(parent, arg, {dataSources}) {
  return dataSources.Book.find({author: parent._id})
},
favouriteBook(parent, arg, {dataSources}) {
  return dataSources.Book.findById(parent.favouriteBook._id)
}
},
}`
    expect(createAllResolver(beggmodel)).to.be.equal(expected)
  })
})

