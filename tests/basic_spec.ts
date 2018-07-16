import { expect } from 'chai'

describe('Basic', () => {
  it('should exports correctly', () => {
    const msm = require('../src')
    expect(msm).to.be.a('object')
    expect(msm.MSM).to.be.a('function')
    expect(msm.MSM.name).to.equal('MSM')
  })
})
