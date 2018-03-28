Storage = require('../../src/Storage')
FormStorage = require('../../src/FormStorage')


describe 'Unit. FormStorage.', ->
  beforeEach () ->
    @storage = new Storage()
    @formStorage = new FormStorage(@storage)

  it "get and set form state", ->
    @formStorage.setStateSilent({ editedValue: 1, touched: true })
    @formStorage.setStateSilent({ submitting: true })

    assert.equal(@formStorage.getState('editedValue'), 1)
    assert.isTrue(@formStorage.getState('touched'))
    assert.isTrue(@formStorage.getState('submitting'))
    assert.isTrue(@formStorage.getState('valid'))

  it "emitStorageEvent", ->
    changeHandler = sinon.spy()
    @formStorage.on('storage', changeHandler)
    @formStorage.emitStorageEvent('update', 'newState', 'oldState')

    sinon.assert.calledOnce(changeHandler)
    sinon.assert.calledWith(changeHandler, {
      action: 'update',
      event: 'storage',
      oldState: 'oldState',
      state: 'newState',
      target: 'form',
    })

  it "getValues", ->
    @storage.setFieldState('path.to.field', {
      savedValue: 'saved'
      editedValue: 'newValue'
    })
    assert.deepEqual(@formStorage.getCombinedValues(), {
      path: {
        to: {
          field: 'newValue'
        }
      }
    })

  it "getEditedValues", ->
    @storage.setFieldState('path.to.field', { editedValue: 'value' })
    assert.deepEqual(@formStorage.getEditedValues(), {
      path: {
        to: {
          field: 'value'
        }
      }
    })

  it "getSavedValues", ->
    @storage.setFieldState('path.to.field', { savedValue: 'value' })
    assert.deepEqual(@formStorage.getSavedValues(), {
      path: {
        to: {
          field: 'value'
        }
      }
    })

  it "getInvalidMessages", ->
    @storage.setFieldState('field', { invalidMsg: 'value' })
    assert.deepEqual(@formStorage.getInvalidMessages(), [
      {
        field: 'field'
        message: 'value'
      }
    ])
