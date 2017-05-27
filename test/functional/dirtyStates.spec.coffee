formHelper = require('../../src/index')

describe 'Functional. Dirty and touched states.', ->
  beforeEach () ->
    this.form = formHelper.newForm()
    this.form.init(['name'])

  it 'initial state of dirty and touched must be false', ->
    assert.isFalse(this.form.fields.name.dirty)
    assert.isFalse(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isFalse(this.form.touched)

  it 'initial state of dirty and touched must be false after setting outer value', ->
    this.form.fields.name.setValue('savedValue')
    assert.isFalse(this.form.fields.name.dirty)
    assert.isFalse(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isFalse(this.form.touched)

  it 'first value change. Dirty and touched must be true', ->
    this.form.fields.name.handleChange('newValue')
    assert.isTrue(this.form.fields.name.dirty)
    assert.isTrue(this.form.fields.name.touched)
    assert.isTrue(this.form.dirty)
    assert.isTrue(this.form.touched)

  it 'set savedValue after user input', ->
    this.form.fields.name.handleChange('newValue')
    this.form.fields.name.setValue('savedValue')
    assert.isFalse(this.form.fields.name.dirty)
    assert.isTrue(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isTrue(this.form.touched)

  it 'set the same outer value', ->
    this.form.fields.name.handleChange('newValue')
    this.form.fields.name.setValue('newValue')
    assert.isFalse(this.form.fields.name.dirty)
    assert.isTrue(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isTrue(this.form.touched)

  it 'change and revert to first value', ->
    this.form.fields.name.setValue('initValue')
    this.form.fields.name.handleChange('newValue')
    this.form.fields.name.handleChange('initValue')
    assert.isFalse(this.form.fields.name.dirty)
    assert.isTrue(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isTrue(this.form.touched)

#  it 'after reinit form', ->
#    this.form.fields.name.handleChange('oldValue')
#    this.form.init({name: 'newValue'})
#    assert.isFalse(this.form.fields.name.dirty)
#    assert.isTrue(this.form.fields.name.touched)
#    assert.isFalse(this.form.dirty)
#    assert.isTrue(this.form.touched)

  it 'after global setting values', ->
    this.form.fields.name.handleChange('newValue')
    this.form.setValues({name: 'newValue'})
    assert.isFalse(this.form.fields.name.dirty)
    assert.isTrue(this.form.fields.name.touched)
    assert.isFalse(this.form.dirty)
    assert.isTrue(this.form.touched)

  it "dirty state must be true if value reverted to ''", ->
    this.form.fields.name.handleChange('newValue')
    this.form.fields.name.handleChange('')
    assert.isFalse(this.form.fields.name.dirty)
