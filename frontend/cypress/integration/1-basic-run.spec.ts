describe('Basic mission control tests', () => {
  before(() => {
    cy.visit('/')
    if (cy.contains('DISCONNECTED')) {
      // Visit twice to skip to 'run' button
      cy.visit('/')

      cy.get('[data-test="run-button"]').click()
      cy.get('[data-test="setup-run-button"]').click()
    }
  });

  it('run with fake data', () => {
    if (cy.contains('PRE_CALIBRATING')) {
      cy.get('[data-test="calibrate-button"]').click()
      cy.contains('CALIBRATING')
      cy.contains('READY', { timeout: 60000 })

      cy.get('[data-test="launch-button"]').click()
      cy.contains('CRUISING')
    }
  })
})
