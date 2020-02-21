const { expect } = require('chai')
const { parse } = require('../../src/modelparser')
const { createFullSchema } = require('../../src/converter/gqlschema')

const begg = `
Book
  _id id!
  title string!
  author Author! ref 
  price float

Author
  _id id!
  name string
  books [Book!]! ref -oppositeidfield author
`

describe('gql schema generator', () => {
  it('creates simple gql schema from 6eggmodel', () => {
    const beggmodel = parse(begg)
    const expected = `\
type Book {
  _id: String!
  title: String!
  author: Author!
  price: Float
}

type Author {
  _id: String!
  name: String
  books: [Book!]!
}`
    expect(createFullSchema(beggmodel)).to.be.equal(expected)
  })
})

