import { expect }           from 'chai'
import sinon                from 'sinon'
import { createMockServer } from '~/main'

describe('mock-server', () => {

  afterEach(() => {
    sinon.restore()
  })

  it('should be a function', () => {
    expect(createMockServer).to.be.a('function')
  })

})
