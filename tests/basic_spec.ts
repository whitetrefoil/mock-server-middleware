import { expect } from 'chai'
import * as msm   from '../src/main'

describe('Basic', () => {
  it('should exports correctly', () => {
    expect(msm).to.be.a('object')
    expect(msm.MSM).to.be.a('function')
    expect(msm.MSM.name).to.equal('MSM')
  })
})
