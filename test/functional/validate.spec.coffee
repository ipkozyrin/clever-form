formHelper = require('../../src/index')

describe 'Functional. Validate.', ->
  beforeEach () ->
    this.form = formHelper.newForm()
    this.form.init(['name'])

  it 'set validateCb on init', ->
    this.form = formHelper.newForm()
    this.form.init({name: {validate: () -> false}})

    this.form.fields.name.handleChange('newValue')
    assert.isFalse(this.form.fields.name.valid)

  it 'validateCb returns false', ->
    this.form.fields.name.setValidateCb(() -> false)
    this.form.fields.name.handleChange('newValue')

    assert.isFalse(this.form.fields.name.valid)
    assert.isUndefined(this.form.fields.name.invalidMsg)
    assert.isFalse(this.form.valid)
    assert.deepEqual(this.form.invalidMessages, {})

  it 'validateCb cb returns message. It means an error', ->
    this.form.fields.name.setValidateCb(() -> 'errorMsg')
    this.form.fields.name.handleChange('newValue')

    assert.isFalse(this.form.fields.name.valid)
    assert.equal(this.form.fields.name.invalidMsg, 'errorMsg')
    assert.isFalse(this.form.valid)
    assert.deepEqual(this.form.invalidMessages, {name: 'errorMsg'})

  it 'validateCb cb returns false and after that returns true', ->
    this.form.fields.name.setValidateCb((params) -> !!params.value)
    this.form.fields.name.handleChange(0)
    this.form.fields.name.handleChange(1)

    assert.isTrue(this.form.fields.name.valid)
    assert.isUndefined(this.form.fields.name.invalidMsg)
    assert.isTrue(this.form.valid)
    assert.deepEqual(this.form.invalidMessages, {})

  it 'validateCb cb returns an empty string = throws an error', ->
    this.form.fields.name.setValidateCb(() -> '')
    assert.throws(this.form.fields.name.handleChange.bind(this.form.fields.name, 'newValue'), /empty string/);

  it 'validateCb cb returns undefined = throws an error', ->
    this.form.fields.name.setValidateCb(() -> undefined)
    assert.throws(this.form.fields.name.handleChange.bind(this.form.fields.name, 'newValue'), /undefined/);
