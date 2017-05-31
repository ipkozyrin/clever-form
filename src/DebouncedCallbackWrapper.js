import _ from 'lodash';

/**
 *
 */
export default class DebouncedCallbackWrapper {
  constructor() {
    this._mainResolve = null;
    this._mainReject = null;
    this._mainPromise = new Promise((resolve, reject) => {
      this._mainResolve = resolve;
      this._mainReject = reject;
    });
    this._callback = null;
    this._cbPromise = null;
    this._started = false;
    this._pending = false;
  }

  getPromise() {
    return this._mainPromise;
  }

  setCallback(cb, params) {
    if (this._started) throw new Error(`The current callback is in progress, you can't set another one.`);
    this._callback = { cb, params };
  }

  isPending() {
    return this._pending;
  }

  isStarted() {
    return this._started;
  }

  cancel() {
    // TODO: отменить результат если уже выполняется
  }

  start() {
    if (!this._callback) throw new Error(`There isn't a callback to run!`);

    this._started = true;
    this._pending = true;

    this._cbPromise = this._callback.cb(...this._callback.params);
    if (!this._isPromise(this._cbPromise)) {
      this._cbPromise = Promise.resolve();
    }

    this._cbPromise.then((data) => {
      this._pending = false;
      this._mainResolve();

      return data;
    }).catch((err) => {
      this._pending = false;
      this._mainReject();

      return Promise.reject(err);
    });
  }

  _isPromise(unnown) {
    return _.isObject(unnown) && unnown.then;
  }

}
