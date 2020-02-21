const { isPrim, isArray, isReference, isEmbed } = require('../beggtype')

function createFullSchema(beggmodel) {
  const pre = 'const { Schema, model, models } = require(\'mongoose\')\n\n'

  const schemas = beggmodel.types.map(createSchema).join('\n')
  const exports = `\n\nmodule.exports = {\n${createExportSchemas(beggmodel).join(',\n')}\n}`
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
  if (isEmbed(field)) {
    if (isArray(field)) {
      return `[${field.itemtype.type}Schema]`
    }
    return `${field.type}Schema`
  }
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

function createExportSchemas(beggmodel) {
  return beggmodel.types.filter(t => t.type === 'base').map(exportSchema)
}

function exportSchema(begg) {
  return `  ${begg.name}: models['${begg.name}'] ? model('${begg.name}') : model('${begg.name}', ${begg.name}Schema)`
}

const beggTypeToMongooseType = {
  id: 'Schema.Types.ObjectId',
  string: 'String',
  number: 'Number',
  float: 'Number',
  date: 'Date',
  buffer: 'Buffer',
  bool: 'Boolean',
}

module.exports = {
  createFullSchema,
  createSchema,
}
