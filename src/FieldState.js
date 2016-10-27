import _ from 'lodash';

import { extendDeep } from './helpers';

export default class FieldState {
  constructor(form, field, name) {
    this._form = form;
    this._field = field;
    this._path = name;

    this._updateFieldState(this._form.$storage.generateNewFieldState(name));
  }

  setValue(newValue) {
    this._form.$storage.setFieldValue(this._path, newValue);
    this._updateFieldState({value: newValue});
  }

  setInitialValue(newValue) {
    this._form.$storage.setFieldInitialValue(this._path, newValue);
    this._updateFieldState({initialValue: newValue});
  }

  setStateValue(stateName, newValue) {
    this._form.$storage.setFieldState(this._path, stateName, newValue);
    this._field[stateName] = newValue;
  }

  _updateFieldState(newState) {
    // TODO: нужна поддержка простых массивов - удаленные элементы останутся
    extendDeep(this._field, newState);
  }
}
