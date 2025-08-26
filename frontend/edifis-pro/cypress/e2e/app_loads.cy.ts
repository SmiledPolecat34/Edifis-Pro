describe('Application Smoke Test', () => {
  it('should load the login page successfully', () => {
    // Visite la racine de l'application
    cy.visit('/');

    // Vérifie la présence d'un élément clé de la page de connexion
    // Note : Cet sélecteur peut avoir besoin d'être ajusté en fonction de votre code.
    cy.contains('h2', 'Connexion').should('be.visible');
  });
});
