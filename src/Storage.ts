import * as _ from 'lodash';
import * as EventEmitter from 'eventemitter3';
import { fromJS, Map } from 'immutable';
import { findRecursively } from './helpers/helpers';
import FormState from './interfaces/FormState';
import FieldState from './interfaces/FieldState';


export interface Store {
  formState: FormState;
  fieldsState: {[index: string]: FieldState};
  values: Map;
}


export default class Storage {
  constructor() {
    this.events = new EventEmitter();

    this._store: Store = {
      formState: new Map(this._generateNewFormState()),
      fieldsState: {},
      // combined saved and edited values
      values: new Map(),
    };
  }

  getWholeStorageState(): Store {
    const store = {
      formState: this._store.formState.toJS(),
      fieldsState: {},
      values: this._store.values.toJS(),
    };

    this.eachField((field, path) => {
      _.set(store.fieldsState, path, field.toJS());
    });

    return store;
  }

  getWholeFormState() {
    return this._store.formState.toJS();
  }

  getFormState(stateName) {
    const formState = this._store.formState.toJS();

    return formState[stateName];
  }

  getCombinedValues() {
    return this._store.values.toJS();
  }

  getListeners(name) {
    return this.events.listeners(name);
  }

  destroy() {
    this._store = {};
    const eventNames = this.events.eventNames();

    _.each(eventNames, (name) => {
      // get handlers by name
      _.each(this.getListeners(name), (handler) => {
        this.events.off(name, handler);
      });
    });
  }

  setFormState(partlyState) {
    const prevState = this.getWholeFormState();

    this._store.formState = fromJS({
      ...prevState,
      ...partlyState,
    });
  }

  eachField(cb) {
    findRecursively(this._store.fieldsState, (field, path) => {
      if (!field || !Map.isMap(field)) return;

      cb(field, path);

      return false;
    });
  }

  getWholeFieldState(pathToField) {
    const fieldState = _.get(this._store.fieldsState, pathToField);

    if (!fieldState) return;

    return fieldState.toJS();
  }

  getFieldState(pathToField, stateName) {
    const fieldState = _.get(this._store.fieldsState, pathToField);

    if (!fieldState) return;

    return _.get(fieldState.toJS(), stateName);
  }

  getCombinedValue(pathToField) {
    const values = this._store.values.toJS();

    return _.get(values, pathToField);
  }

  /**
   * Set state value to field.
   * Field has to be initialized previously.
   * @param pathToField
   * @param partlyState
   */
  setFieldState(pathToField, partlyState) {
    const prevState = this.getWholeFieldState(pathToField);

    const newState = fromJS({
      ...prevState,
      ...partlyState,
    });

    _.set(this._store.fieldsState, pathToField, newState);

    _.find(partlyState, (item, name) => {
      if (_.includes([ 'savedValue', 'editedValue' ], name)) return true;
    });

    this._updateCombinedValue(pathToField, newState.get('savedValue'), newState.get('editedValue'));
  }

  generateNewFieldState() {
    return {
      defaultValue: undefined,
      dirty: false,
      disabled: false,
      // top layer
      editedValue: undefined,
      focused: false,
      initial: undefined,
      invalidMsg: undefined,
      touched: false,
      // bottom layer
      savedValue: undefined,
      saving: false,
    };
  }

  _generateNewFormState() {
    return {
      touched: false,
      submitting: false,
      saving: false,
      valid: true,
    };
  }

  _updateCombinedValue(pathToField, savedValue, editedValue) {
    let combinedValue = _.isUndefined(editedValue) ? savedValue : editedValue;
    combinedValue = _.cloneDeep( combinedValue );
    this._store.values = this._store.values.setIn(pathToField.split('.'), combinedValue);
  }

}