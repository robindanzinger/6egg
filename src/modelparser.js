function parse(model) {
  const lines = model.split('\n')
  const m = {
    types: [],
  }
  lines.reduce((type, line) => {
    if (line.trim() === '') return type
    const values = line.split(' ')
    if (values[0] !== '') {
      type = parseObject(values)
      m.types.push(type)
    } else {
      type.fields.push(parseField(values))
    }
    return type
  })

  return m
}

function parseObject(values) {
  return {
    name: values[0],
    type: values[1] || 'base',
    fields: [],
  }
}

function parseField(values) {
  const fvalues = values.filter(v => v !== '')
  const type  = parseFieldType(fvalues[1], fvalues)
  type.name = fvalues[0]
  type.options = parseOptions(fvalues)
  return type
}

function parseFieldType(value, values) {
  const isArray = value.indexOf('[') >= 0
  return isArray ? parseArray(value, values) : parseItemType(value, values)
}

function parseItemType(value, values) {
  const required = value.indexOf('!') > 0
  const type = required ? value.substring(0, value.length - 1) : value
  return isPrim(type) ? parsePrimType(required, type) : parseObjectType(required, type, values)
}
function parsePrimType(required, type) {
  return {group: 'prim', required, type}
}

function parseObjectType(required, type, values) {
  const reftype = values[2] ? values[2] : 'embed'
  return {group: 'object', required, type, reftype}
}

function isPrim(type) {
  return ['id', 'string', 'number', 'float', 'date', 'bool'].some(e => e === type)
}

function parseArray(value, values) {
  const itemtype = parseItemType(value.substring(value.indexOf('[') + 1, value.indexOf(']')), values)
  const required = value.substring(value.indexOf(']')).indexOf('!') > 0
  return {
    group: 'array', 
    required, 
    itemtype
  }
}

function parseOptions(values) {
  if (!values) return undefined
  const options = [] 
  values.reduce((opt, val) => {
    if (val.startsWith('-')) {
      const option = {}
      option.name = val.substring(1)
      options.push(option)
      return option
    }
    else if (opt) {
      opt.value = val
      return opt
    }
    return undefined
  })
  return options.reduce((acc, cur) => {
    acc[cur.name] = cur.value
    return acc
  }, {})
}
  

module.exports = {
  parse,
  parseField
}
