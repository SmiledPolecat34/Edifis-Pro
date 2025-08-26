describe('Smoke Test', () => {
  it('should load the home page', () => {
    // Visite l'URL de base configurée dans cypress.config.ts (ou votre fichier de config)
    cy.visit('/');

    // Vérifie qu'un élément clé de votre page d'accueil est bien présent.
    // Par exemple, si vous avez un titre h1 avec le nom de l'application.
    // NOTE: Vous devrez peut-être ajuster le sélecteur ci-dessous pour qu'il corresponde
    // au contenu réel de votre page d'accueil.
    cy.get('h1').should('contain', 'Edifis-Pro');
  });
});