describe('Basic ::', () => {
  jest.resetModules()

  beforeEach(() => {
    jest.resetModules()
  })

  it('should exports correctly', () => {
    const msm = require('../src')
    expect(typeof msm).toBe('object')
    expect(typeof msm.MSM).toBe('function')
    expect(msm.MSM.name).toBe('MSM')
  })
})
