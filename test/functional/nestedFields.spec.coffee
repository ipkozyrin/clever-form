formkit = require('../../src/index')


describe 'Functional. nestedFields.', ->
  beforeEach () ->
    @form = formkit.newForm()
    @form.init([ 'nested.name' ])

  it 'initial values', ->
    assert.equal(@form.fields.nested.name.name, 'name')
    assert.equal(@form.fields.nested.name.fullName, 'nested.name')
    assert.isUndefined(@form.fields.nested.name.value)
    assert.isUndefined(@form.fields.nested.name.savedValue)

  it 'user input', ->
    @form.fields.nested.name.handleChange('newValue')
    assert.equal(@form.fields.nested.name.value, 'newValue')
    assert.isUndefined(@form.fields.nested.name.savedValue)
    assert.isTrue(@form.fields.nested.name.dirty)
    assert.isTrue(@form.fields.nested.name.touched)

    assert.deepEqual(@form.values, {nested: {name: 'newValue'}})
    assert.isTrue(@form.dirty)
    assert.isTrue(@form.touched)

  it 'saved change', ->
    @form.fields.nested.name.setSavedValue('savedValue')
    assert.equal(@form.fields.nested.name.value, 'savedValue')
    assert.equal(@form.fields.nested.name.savedValue, 'savedValue')

    assert.deepEqual(@form.values, {nested: {name: 'savedValue'}})

  it 'validation', ->
    @form.setValidateCb((errors) -> errors.nested.name = 'errorMsg')
    @form.fields.nested.name.handleChange('newValue')

    assert.isFalse(@form.fields.nested.name.valid)
    assert.equal(@form.fields.nested.name.invalidMsg, 'errorMsg')
    assert.isFalse(@form.valid)
    assert.deepEqual(@form.invalidMessages, [{ field: 'nested.name', message: 'errorMsg' }])

  it 'events', ->
    @fieldOnChangeHandler = sinon.spy()
    @formOnChangeHandler = sinon.spy()
    @form.fields.nested.name.onChange(@fieldOnChangeHandler)
    @form.onChange(@formOnChangeHandler)

    @form.fields.nested.name.handleChange('userValue')
    sinon.assert.calledOnce(@fieldOnChangeHandler)
    sinon.assert.calledOnce(@formOnChangeHandler)

  it 'saving', ->
    @saveHandler = sinon.spy();
    @form.fields.nested.name.onSave(@saveHandler)
    @form.fields.nested.name.handleChange('newValue')
    @form.fields.nested.name.flushSaving()

    sinon.assert.calledOnce(@saveHandler)
    sinon.assert.calledWith(@saveHandler, 'newValue')
