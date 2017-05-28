/* eslint func-style: off */

import _ from 'lodash';

export function extendDeep(willExtend, newValues) {
  _.each(newValues, (value, name) => {
    if (_.isPlainObject(value)) {
      // create container if it isn't exist
      if (!_.isPlainObject(willExtend[name])) {
        willExtend[name] = {};
      }
      // run recursively
      extendDeep(willExtend[name], value);
    }
    else {
      willExtend[name] = value;
    }
  });

  return willExtend;
}

export function findInFieldRecursively(rootObject, cb) {
  const recursive = (obj) => _.find(obj, (item) => {
    if (!_.isPlainObject(item) && !item.name) return;
    if (item.name) {
      // it's field
      return cb(item);
    }
    else {
      return recursive(item);
    }
  });

  return recursive(rootObject);
}

export function calculateDirty(value, savedValue) {
  let newDirtyValue;

  // null, undefined and '' - the same, means dirty = false. 0 compares as a common value.
  if ((value === '' || _.isNil(value))
    && (savedValue === '' || _.isNil(savedValue))) {
    newDirtyValue = false;
  }
  else {
    // just compare current value and saved value
    newDirtyValue = value !== savedValue;
  }

  return newDirtyValue;
}
