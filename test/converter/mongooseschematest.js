const { expect } = require('chai')
const  { parse } = require('../../src/modelparser')
const { createFullSchema } = require('../../src/converter/mongooseschema.js')

const begg = `

Address embed
  street string
  city string

Book
  _id id!
  title string!
  author Author! ref 

Author
  _id id!
  name string
  address Address embed
  addresses [Address] embed
  books [Book!]! ref -oppositeidfield author

`

describe('mongoose schema generator', () => {
  it.only('creates schema for simple 6egg model', () => {
    const beggmodel = parse(begg)
    const expected = `\
const { Schema, model, models } = require('mongoose')

const AddressSchema = new Schema({
  street: { type: String, required: false },
  city: { type: String, required: false }
})
const BookSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true }
})
const AuthorSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: false },
  address: AddressSchema,
  addresses: [AddressSchema],
  books: { type: [Schema.Types.ObjectId], ref: 'Book', required: true }
})

module.exports = {
  Book: models['Book'] ? model('Book') : model('Book', BookSchema),
  Author: models['Author'] ? model('Author') : model('Author', AuthorSchema)
}`
    expect(createFullSchema(beggmodel)).to.be.equal(expected)
  })
})

