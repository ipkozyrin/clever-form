import _ from 'lodash';

import FormState from './FormState';
import FieldsManager from './FieldsManager';

export default class Form {
  constructor(storage) {
    this.$storage = storage;
    this._formState = new FormState(this);
    this._fieldsManager = new FieldsManager(this);

    this._onChangeCallback = null;
    this._onAnyChangeCallback = null;
    this._onSubmitCallback = null;
    this.fields = this._fieldsManager.fields;
  }

  $stateValueChanged(stateName, newValue) {
    this._formState.setStateValue(stateName, newValue);
  }

  $valueChangedByUser(fieldName, newValue) {
    if (this._onChangeCallback) this._onChangeCallback(fieldName, newValue);
  }

  $validChanged(fieldName, isValid, invalidMsg) {
    var newInvalidMessages = { ...this.invalidMsg };
    if (isValid) {
      delete newInvalidMessages[fieldName];
    }
    else {
      newInvalidMessages[fieldName] = invalidMsg;
    }

    this._formState.setStateValue('invalidMsg', newInvalidMessages);

    var isFormValid = _.isEmpty(newInvalidMessages);
    this._formState.setStateValue('valid', isFormValid);
  }

  $valueChanged(fieldName, newValue) {
    this._formState.setFieldValue(fieldName, newValue);
    if (this._onAnyChangeCallback) this._onAnyChangeCallback({[fieldName]: newValue});
  }

  $initialValueChanged(fieldName, newInitialValue) {
    this._formState.setFieldInitialValue(fieldName, newInitialValue);
  }

  init(initialState) {
    this.setInitialValues(initialState);
  }

  getValues() {
    return this._formState.getValues();
  }

  getInitialValues() {
    return this._formState.getInitialValues();
  }

  setValues(newValues) {
    this._fieldsManager.setValues(_.cloneDeep(newValues));
  }

  setInitialValues(initialState) {
    this._fieldsManager.setInitialValues(initialState);
  }

  onChange(cb) {
    this._onChangeCallback = cb;
  }

  onAnyChange(cb) {
    this._onAnyChangeCallback = cb;
  }

  /**
   * It must be placed to <form> element on onSubmit attribute.
   */
  handleSubmit() {
    if (!this._onSubmitCallback) return;
    this._formState.setStateValue('submitting', true);
    var returnedValue = this._onSubmitCallback(this.values);
    // if promise
    if (returnedValue && returnedValue.then) {
      return returnedValue.then(() => {
        this._formState.setStateValue('submitting', false);
      }, () => {
        this._formState.setStateValue('submitting', false);
      });
    }
    this._formState.setStateValue('submitting', false);
  }

  onSubmit(cb) {
    this._onSubmitCallback = cb;
  }

  reset() {
    // TODO: !!!
  }
}
