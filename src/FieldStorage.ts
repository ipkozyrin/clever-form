import * as _ from 'lodash';


export default class FieldStorage {
  constructor(storage) {
    this._storage = storage;
  }

  initState(pathToField, initialState) {
    const newState = {
      ...this._storage.generateNewFieldState(),
      ...initialState,
    };

    this.setStateSilent(pathToField, newState);
  }

  /**
   * get current value
   * @param {string} pathToField - path to your field
   * @return {*}
   */
  getCombinedValue(pathToField) {
    return this._storage.getCombinedValue(pathToField);
  }

  getState(pathToField, stateName) {
    return this._storage.getFieldState(pathToField, stateName);
  }

  getWholeState(pathToField) {
    return this._storage.getWholeFieldState(pathToField);
  }

  setStateSilent(pathToField, partlyState) {
    this._storage.setFieldState(pathToField, partlyState);
  }

  emitStorageEvent(pathToField, action, newState, oldState) {
    if (_.isEqual(oldState, newState)) return;

    const fieldEventdata = {
      field: pathToField,
      target: 'field',
      event: 'storage',
      state: newState,
      oldState,
      action,
    };
    this.emit(pathToField, 'storage', fieldEventdata);

    const formEventData = {
      field: pathToField,
      target: 'field',
      event: 'storage',
      state: newState,
      oldState,
      action,
    };
    this._storage.events.emit('storage', formEventData);
  }

  on(pathToField, eventName, cb) {
    this._storage.events.on(`field.${pathToField}.${eventName}`, cb);
  }

  emit(pathToField, eventName, data) {
    this._storage.events.emit(`field.${pathToField}.${eventName}`, data);
  }

  off(pathToField, eventName, cb) {
    this._storage.events.off(`field.${pathToField}.${eventName}`, cb);
  }

  /**
   * Field means unsaved if its value not equal to previously saved value.
   * @param {string} pathToField - path to your field
   * @return {boolean} - true if field unsaved
   */
  isFieldUnsaved(pathToField) {
    const savedValue = this.getState(pathToField, 'savedValue');
    const editedValue = this.getState(pathToField, 'editedValue');

    return savedValue !== editedValue;
  }

}