const { isPrim, isObject, isArray, isReference } = require('../beggtype')

function createFullSchema(beggmodel) {
  const pre = 'const { Schema, model, models } = require(\'mongoose\')\n\n'

  const schemas = beggmodel.types.map(createSchema).join('\n')
  const exports = `\n\nmodule.exports = {\n${beggmodel.types.map(exportSchema).join(',\n')}\n}`
  return pre + schemas + exports
}

function createSchema(object) {
  return `\
const ${object.name}Schema = new Schema({
${createSchemaFields(object).join(',\n')}
})`
}

function createSchemaFields(type) {
  return type.fields.map(createSchemaField)
}

function createSchemaField(field) {
  return `  ${field.name}: ${toMongooseSchemaType(field)}`
}

function toMongooseSchemaType(field) {
  return `{ type: ${getType(field)}, required: ${isRequired(field)} }`
}

function isRequired(field) {
  return field.required ? true : false
}

function getType(field) {
  if (isPrim(field)) {
    return beggTypeToMongooseType[field.type] 
  }
  if (isReference(field)) {
    if (isArray(field)) {
      return `[Schema.Types.ObjectId], ref: '${field.itemtype.type}'` 
    }
    return `Schema.Types.ObjectId, ref: '${field.type}'` 
  }
}

function exportSchema(begg) {
  return `  ${begg.name}: models['${begg.name}'] ? model('${begg.name}') : model('${begg.name}', ${begg.name}Schema)`
}

const beggTypeToMongooseType = {
  id: 'Schema.Types.ObjectId',
  string: 'String',
  number: 'Number',
  date: 'Date',
  buffer: 'Buffer',
  boolean: 'Boolean',
  mixed: 'Schema.Types.Mixed',
  array: 'Schema.Types.Array',
  decimal128: 'Schema.Types.Decimal128',
  map: 'Map',
}

module.exports = {
  createFullSchema,
  createSchema,
}
