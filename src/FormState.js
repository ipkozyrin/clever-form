import _ from 'lodash';

import { extendDeep } from './helpers';

export default class FormState {
  constructor(form) {
    this._form = form;

    // set initial form state
    this._updateFormState({
      values: {},
      initialValues: {},
      dirty: null,
      touched: null,
      valid: null,
      focusedField: null,
      submitting: null,
    });
  }

  getValues() {
    return _.cloneDeep(this.values);
  }

  setFieldValue(fieldName, newValue) {
    this._updateFormState({values: {[fieldName]: newValue}});
  }

  setFieldInitialValue(fieldName, newValue) {
    this._updateFormState({initialValues: {[fieldName]: newValue}});
  }

  _updateFormState(newState) {
    extendDeep(this._form, newState);
  }

  // setValues(values) {
  //   // TODO: нужно ли удалять лишние поля, если полей стало меньше??? наверное нет
  //   //_.extend(this.state.values, values);
  //   this._updateFormState({values: values});
  // }

  // setInitialValues(initialValues) {
  //   // TODO: нужно deep extend
  //   _.extend(this.state.initialValues, initialValues);
  //   // _.each(fieldsList, (fieldName) => {
  //   //   this.state.values[fieldName] = null;
  //   // });
  // }
}
