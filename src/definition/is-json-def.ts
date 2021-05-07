import isPlainObject from 'is-plain-obj'
import type { JsonApiDefinition } from '../interfaces'


export default function isJsonApiDefinition(obj: unknown): obj is JsonApiDefinition {
  return isPlainObject(obj) && Object.prototype.hasOwnProperty.call(obj, 'body')
}
