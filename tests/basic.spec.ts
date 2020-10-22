import { expect }                           from 'chai'
import { createMockServer, createRecorder } from '~/main'

describe('Basic', () => {
  it('should exports correctly', () => {
    expect(createMockServer).to.be.a('function')
    expect(createRecorder).to.be.a('function')
  })
})
