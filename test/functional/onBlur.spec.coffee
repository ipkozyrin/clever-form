formkit = require('../../src/index')


describe 'Functional. onBlur.', ->
  beforeEach () ->
    @form = formkit.newForm()
    @form.init(['name'])
    @onSaveHandler = sinon.spy();
    @form.onSave(@onSaveHandler);

  it "run handle blur if saving is in progress", ->
    @form.fields.name.handleChange('newValue')

    assert.isTrue(@form._debouncedSave.isWaiting())

    @form.fields.name.handleBlur()

    assert.isFalse(@form._debouncedSave.isWaiting())
    sinon.assert.calledOnce(@onSaveHandler)
