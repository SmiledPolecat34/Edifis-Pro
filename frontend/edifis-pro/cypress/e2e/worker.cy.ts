describe('Worker Page', () => {
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

  it('should load the worker page and display key elements', () => {
    // Navigue vers la page des employés en cliquant sur le lien
    cy.contains('Employés').click();

    // Vérifie le titre de la page
    cy.get('h1').should('contain', 'Employés');

    // Vérifie la présence du bouton "+ Employé"
    cy.contains('+ Employé').should('be.visible');

    // Vérifie la présence du champ de recherche
    cy.get('input[placeholder="Rechercher par nom, prénom, compétences..."]').should('be.visible');
  });
});