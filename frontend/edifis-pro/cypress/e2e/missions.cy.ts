describe('Missions Page', () => {
  beforeEach(() => {
    // Visite la page de connexion et se connecte
    cy.visit('/');
    cy.get('#email').type('admin@edifis-pro.com');
    cy.get('#password').type('AdminEdifis2025!');
    cy.contains('Se connecter').click();
    // Attendre que la page d'accueil se charge
    cy.wait(1000); // attend 1 seconde
    cy.get('h1').should('contain', 'Bienvenue, Admin Edifis');
  });

  it('should load the missions page and display key elements', () => {
    // Navigue vers la page des missions en cliquant sur le lien
    cy.contains('Missions').click();

    // Vérifie le titre de la page
    cy.get('h1').should('contain', 'Missions');

    // Vérifie la présence du bouton "Ajouter une mission"
    cy.contains('Ajouter une mission').should('be.visible');

    // Vérifie la présence du champ de recherche
    cy.get('input[placeholder="Rechercher une mission..."]').should('be.visible');
  });
});