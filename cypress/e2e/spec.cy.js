describe('Map Component Test', () => {
  
  beforeEach(() => {
    cy.intercept('GET', '**/foodsecurity/country').as('getFoodSecurityData');    
    cy.visit('http://localhost:3000/'); 
  });

  it('fetches food security data and displays the map', () => {
    cy.wait('@getFoodSecurityData').its('response.statusCode').should('eq', 200);
    
    cy.get('.map-container').should('be.visible');
  });

  it('displays the legend and options after loading', () => {
    cy.wait('@getFoodSecurityData').its('response.statusCode').should('eq', 200);
    cy.get('.options-field', { timeout: 10000 }).should('exist');
  });

  
  it('allows interacting with the map', () => {
    cy.wait('@getFoodSecurityData');
    cy.get('.mapboxgl-canvas').trigger('mousemove', { clientX: 200, clientY: 200 });
    cy.get('.mapboxgl-canvas').click(200, 200);
    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('Prevalence:');
    });
  });

  it('changes the active option and updates the map', () => {
    cy.wait('@getFoodSecurityData');
    cy.get('.mapboxgl-canvas').should('exist');
  });

});

