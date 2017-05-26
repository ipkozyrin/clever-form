import _ from 'lodash';

import FormHandlers from './FormHandlers';
import Field from './Field';
import { findInFieldRecursively } from './helpers';


// TODO: объединить с FormBase

export default class Form {
  constructor(storage, config, events) {
    this.$storage = storage;
    this.$events = events;
    this.$config = config;
    // TODO: review - isn't good
    this.$handlers = new FormHandlers(this);

    this.__fields = {};
    this._onSubmitCallback = null;
  }

  get fields() {
    return this.__fields;
  }
  get values() {
    return this.$storage.getValues();
  }
  get dirty() {
    return this.$storage.getFormState('dirty');
  }
  get touched() {
    return this.$storage.getFormState('touched');
  }
  get submitting() {
    return this.$storage.getFormState('submitting');
  }
  get valid() {
    return this.$storage.getFormState('valid');
  }
  get invalidMsgList() {
    return this.$storage.getFormState('invalidMsgList');
  }

  /**
   * It calls from outer app's code to init form.
   * @param initialFields
   */
  init(initialFields) {
    this._reinitFields(initialFields);
  }

  on(eventName, cb) {
    // TODO: зачем, если есть отдельные методы???
    this.$events.addListener(eventName, cb);
  }

  onChange(cb) {
    this.$handlers.$onChangeCallback = cb;
  }

  onSave(cb) {
    this.$handlers.$onSaveCallback = cb;
  }

  onSubmit(cb) {
    this._onSubmitCallback = cb;
  }


  /**
   * It must be placed to <form> element on onSubmit attribute.
   * @return {Promise}
   */
  handleSubmit() {
    // TODO: добавить возможность просто запускать handleSubmit без указания _onSubmitCallback
    // TODO: должно поддерживать cancelSaving() and flushSaving()

    if (!this.$config.allowSubmitSubmittingForm) {
      // do nothing if form is submitting at the moment
      if (this.$storage.getFormState('submitting')) return;
    }
    if (!this.$config.allowSubmitUnchangedForm) {
      if (!this.$storage.getFormState('dirty')) return;
    }

    this.$storage.setFormState('submitting', true);
    const values = _.clone(this.$storage.getValues());

    // TODO: validate

    return this._handleSubmitCallback(values);
  }

  /**
   * Roll back to previously saved values.
   */
  resetUserInput() {
    // TODO: наверное должны сброситься touched, dirty, valid, invalidMsg
    findInFieldRecursively(this.fields, (field) => {
      field.resetUserInput();
    });
  }

  /**
   * Cancel debounce waiting for saving
   */
  cancelSaving() {
    this.$handlers.$debouncedCall.cancel();
  }

  /**
   * Saving immediately
   */
  flushSaving() {
    this.$handlers.$debouncedCall.flush();
  }

  /**
   * Soft update of values
   * @param newValues
   */
  setValues(newValues) {
    // TODO: ???? WTF is _hardUpdateValues
    this._hardUpdateValues(newValues);
  }

  // getConfig() {
  //   return this.$config;
  // }

  $getWholeStorageState() {
    return this.$storage.getWholeStorageState();
  }


  _updateAllDirtyStates() {
    findInFieldRecursively(this.fields, (field) => {
      field.$updateDirty();
    });
  }

  _reinitFields(initialFields) {
    // TODO: review!!!!!
    // TODO: вынести в helpers

    if (_.isArray(initialFields)) {
      _.each(initialFields, (pathToField) => {
        // Create new field if it doesn't exist
        let field = _.get(this.fields, pathToField);
        if (!field) {
          field = new Field(this, pathToField);
          _.set(this.fields, pathToField, field);
        }
        else {
          // reset dirty

        }

        // set outer value with reset dirty and user input
        field.value = null;
      });
    }
    else if (_.isPlainObject(initialFields)) {
      _.each(initialFields, (value, pathToField) => {
        // Create new field if it doesn't exist
        let field = _.get(this.fields, pathToField);
        if (!field) {
          field = new Field(this, pathToField);
          _.set(this.fields, pathToField, field);
        }
        else {
          // reset dirty

        }

        // set outer value with reset dirty and user input
        field.value = value;
      });
    }
    else {
      throw new Error(`Bad type of fields param`);
    }
  }

  _hardUpdateValues(newValues) {
    // TODO: ???? WTF is _hardUpdateValues
    _.each(newValues, (value, fieldName) => {
      if (this.fields[fieldName]) this.fields[fieldName].value = value;
    });
  }

  _handleSubmitCallback(values) {
    // TODO: make simpler
    // TODO: review - especially updateOuterValues

    const updateOuterValues = () => {
      if (this.$config.updateOuterValuesAfterSubmit) {
        this.$storage.updateOuterValues(values);
        this._updateAllDirtyStates();
      }
    };


    if (this._onSubmitCallback) {
      const returnedValue = this._onSubmitCallback(values);

      // if promise
      if (returnedValue && returnedValue.then) {
        return returnedValue.then((data) => {
          this.$storage.setFormState('submitting', false);
          updateOuterValues();

          return data;
        }, (err) => {
          this.$storage.setFormState('submitting', false);

          return err;
        });
      }
    }

    // without _onSubmitCallback or with _onSubmitCallback and it doesn't return a promise
    this.$storage.setFormState('submitting', false);
    updateOuterValues();

    return Promise.resolve();
  }

}
