describe('Smoke Test', () => {
  it('should load the home page after login', () => {
    // Visite l'URL de base
    cy.visit('/');

    // Entrer l'email et le mot de passe
    cy.get('#email').type('admin@edifis-pro.com');
    cy.get('#password').type('AdminEdifis2025!');

    // Cliquer sur le bouton de connexion
    cy.contains('Se connecter').click();

    // Attendre que la page d'accueil se charge
    cy.wait(1000); // attend 1 seconde

    // Vérifier que l'on est bien sur la page d'accueil
    // en cherchant un élément spécifique à cette page.
    cy.get('h1').should('contain', 'Bienvenue, Admin Edifis');
  });
});