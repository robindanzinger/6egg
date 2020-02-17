const { beggTypeToGqlType } = require('./gqlhelper')
const { isPrim, isObject, isArray } = require('../beggtype')


function createFullSchema(beggmodel) {
  return beggmodel.types.reduce((arr, type) => {
    arr.push(createSchema(type))
    return arr
  }, []).join('\n\n')
}

function createSchema(type) {
  return `\
type ${type.name} {
${createSchemaFields(type)}
}`
}

function createSchemaFields(type) {
  return type.fields.map(createSchemaField).join('\n')
}

function createSchemaField(field) {
  return `  ${field.name}: ${getType(field.type)}`
}

function getType(type) {
  const required = type.required ? '!' : ''
  if (isPrim(type)) {
    return beggTypeToGqlType[type.type] + required
  }
  if (isObject(type)) {
    return type.type + required
  }
  if (isArray(type)) {
    return `[${getType(type.itemtype)}]${required}`
  }
}

module.exports = {
  createFullSchema,
  createSchema,
}
