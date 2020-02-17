const { expect } = require('chai')
const { parse } = require('../../src/modelparser')

const begg = `
Book
  _id id!
  title string!
  author Author! ref 

Author
  _id id!
  name string
  books [Book!]! ref -oppositeidfield author
`

describe('mongoose schema generator', () => {
  it.skip('creates schema for simple 6egg model', () => {
    const beggmodel = parse(begg)
    const expected = `\
{
Book: {
author(parent, arg, {dataSource}) => {
  return dataSource.Author.findById(parent.author._id)
})
},
Author: {
books(parent, arg, {dataSource}) => {
  return dataSource.Book.find({author: parent._id})
})
},
}`
    //    expect(createFullSchema(beggmodel)).to.be.equal(expected)
  })
})

