import isArray from 'lodash-es/isArray'
import isObject from 'lodash-es/isObject'
import mapValues from 'lodash-es/mapValues'

export const deepMap = (value, callback) => {
  const result = callback(value);
  if (result !== undefined) return result;
  
  if (isArray(value)) return value.map(item => deepMap(item, callback));
  if (isObject(value)) return mapValues(value, val => deepMap(val, callback));
  return value;
}