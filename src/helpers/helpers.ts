import * as _ from 'lodash';
import FieldSchema from '../interfaces/FieldSchema';
import Field from '../Field';


export const FIELD_PATH_SEPARATOR = '.';


/**
 * Each all the fields and find certain field.
 * If cb returned true - finding will be stopped and found field will returned
 */
export function findFieldRecursively(
  fields: {[index: string]: object},
  cb: (field: Field, path: string) => boolean | Field | void
): Field | void {
  const recursive = (obj: {[index: string]: object}, rootPath: string): Field | void => {
    const foundField = _.find(obj, (item: object, name: string): Field | boolean | void => {
      const itemPath: string = _.trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);

      if (item instanceof Field) {
        // it's a field
        return cb(item, itemPath);
      }
      else if (_.isPlainObject(item)) {
        // it's a container
        return recursive(item as {[index: string]: object}, itemPath);
      }
      else {
        throw new Error(`Wrong fields dict`);
      }
    });

    return foundField as Field | void;
  };

  return recursive(fields, '');
}

export function eachFieldRecursively(
  fields: {[index: string]: object},
  cb: (field: Field, path: string) => void
): void {
  const recursive = (obj: {[index: string]: object}, rootPath: string): void => {
    _.each(obj, (item: object, name: string): void => {
      const itemPath: string = _.trim(`${rootPath}.${name}`, FIELD_PATH_SEPARATOR);

      if (item instanceof Field) {
        // it's a field
        cb(item, itemPath);
      }
      else if (_.isPlainObject(item)) {
        // it's a container
        recursive(item as {[index: string]: object}, itemPath);
      }
      else {
        throw new Error(`Wrong fields dict`);
      }
    });
  };

  recursive(fields, '');
}

export function eachFieldSchemaRecursively(
  rootObject: {[index: string]: any},
  cb: (item: {[index: string]: any}, path: string) => any
): void {

  // TODO: use eachRecursively

  findRecursively(rootObject, (item: {[index: string]: any}, path: string): boolean | void => {
    if (!_.isPlainObject(item)) return false;

    // means field
    if (_.isEmpty(item) || isFieldSchema(item)) {
      cb(item, path);

      // don't go deeper
      return false;
    }
  })
}

export function isFieldSchema(comingSchema) {

  // TODO: упростить, может проверять интерфейс FieldSchema

  let isSchema = false;
  const filedParams = [
    'initial',
    'disabled',
    'defaultValue',
    'savedValue',
    'debounceTime',
  ];

  _.find(comingSchema, (value, name) => {
    if (_.includes(filedParams, name)) {
      isSchema = true;

      return true;
    }
  });

  return isSchema;
}

/**
 * It works with common structures like
 *     {
 *       parent: {
 *         prop: 'value'
 *       }
 *     }
 * @param rootObject
 * @param {function} cb - callback like (items, pathToItem) => {}.
 *                        If it returns false it means don't go deeper.
 */
export function findRecursively(
  rootObject: {[index: string]: any},
  cb: (item: any, path: string) => boolean | void
): void {
  const recursive = (obj, rootPath) => _.find(obj, (item, name) => {
    const itemPath = _.trim(`${rootPath}.${name}`, '.');

    const cbResult = cb(item, itemPath);
    if (_.isUndefined(cbResult)) {
      // go deeper
      return recursive(item, itemPath);
    }
    else if (cbResult === false) {
      // don't go deeper
      return undefined;
    }
    else {
      // found - stop search
      return cbResult;
    }
  });

  return recursive(rootObject, '');
}

export function calculateDirty(editedValue: any, savedValue: any): boolean {
  // if edited value don't specified - it means field isn't dirty
  if (_.isUndefined(editedValue)) return false;

  // null, undefined and '' - the same, means dirty = false. 0 compares as a common value.
  if ((editedValue === '' || _.isNil(editedValue)) && (savedValue === '' || _.isNil(savedValue))) {
    return false;
  }
  else {
    // just compare current editedValue and saved value
    return editedValue !== savedValue;
  }
}

export function getFieldName(pathToField: string): string {
  const split: Array<string> = pathToField.split('.');
  const lastItem: string | undefined = _.last(split);

  if (typeof lastItem === 'undefined') return pathToField;

  return lastItem;
}

export function isPromise(unknown: any) {
  return _.isObject(unknown) && unknown.then;
}

export function resolvePromise(value: any): Promise<any> {
  if (isPromise(value)) return value;

  return Promise.resolve();
}

export function parseValue(rawValue: any): any {
  if (_.isUndefined(rawValue)) {
    return;
  }
  if (_.isNull(rawValue)) {
    return null;
  }
  else if (rawValue === 'true') {
    return true;
  }
  else if (rawValue === 'false') {
    return false;
  }
  else if (rawValue === 'null') {
    return null;
  }
  else if (rawValue === 'NaN') {
    return NaN;
  }
  else if (rawValue === '') {
    return '';
  }
  // it is for - 2. strings
  else if (_.isString(rawValue) && rawValue.match(/^\d+\.$/)) {
    // TODO: why not number ????
    return rawValue;
  }
  else if (_.isBoolean(rawValue) || _.isPlainObject(rawValue) || _.isArray(rawValue)) {
    return rawValue;
  }

  const toNumber = _.toNumber(rawValue);

  if (!_.isNaN(toNumber)) {
    // it's number
    return toNumber;
  }

  // string
  return rawValue;
}


// /**
//  * It works with structure like this:
//  *     {
//  *       parent: {
//  *         // this will be pass to callback: cb({fieldProp: 'value'}, 'parent.field')
//  *         field: {
//  *           fieldProp: 'value'
//  *         }
//  *       }
//  *     }
//  * @param rootObject
//  * @param cb
//  */
// findFieldLikeStructureRecursively(rootObject, cb) {
//   const isContainer = (item) => {
//     let container = true;
//     _.find(item, (field) => {
//       if (!_.isPlainObject(field)) {
//         container = false;
//
//         return true;
//       }
//     });
//
//     return container;
//   };
//
//   const recursive = (obj, rootPath) => _.find(obj, (item, name) => {
//     const itemPath = _.trim(`${rootPath}.${name}`, '.');
//
//     if (_.isPlainObject(item) && isContainer(item)) {
//       return recursive(item, itemPath);
//     }
//     else {
//       // it's field
//       return cb(item, itemPath);
//     }
//   });
//
//   return recursive(rootObject, '');
// },

// parseValidateCbReturn(cbReturn) {
//   const invalidMsg = (_.isString(cbReturn) && cbReturn !== '') ? cbReturn : undefined;
//   let result;
//   if (cbReturn === true) {
//     result = true;
//   }
//   else if (invalidMsg) {
//     result = invalidMsg;
//   }
//   else {
//     result = false;
//   }
//
//   return {
//     valid: cbReturn === true,
//     invalidMsg,
//     result,
//   };
// },
