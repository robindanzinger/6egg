const { beggTypeToGqlType } = require('./gqlhelper')
const { isPrim, isObject, isArray } = require('../beggtype')


function createFullSchema(beggmodel) {
  return beggmodel.types.reduce((arr, type) => {
    arr.push(createSchema(type))
    return arr
  }, []).join('\n\n')
}

function createSchema(object) {
  return `\
type ${object.name} {
${createSchemaFields(object)}
}`
}

function createSchemaFields(type) {
  return type.fields.map(createSchemaField).join('\n')
}

function createSchemaField(field) {
  return `  ${field.name}: ${getType(field)}`
}

function getType(field) {
  const required = field.required ? '!' : ''
  if (isPrim(field)) {
    return beggTypeToGqlType[field.type] + required
  }
  if (isObject(field)) {
    return field.type + required
  }
  if (isArray(field)) {
    return `[${getType(field.itemtype)}]${required}`
  }
}

module.exports = {
  createFullSchema,
  createSchema,
}
