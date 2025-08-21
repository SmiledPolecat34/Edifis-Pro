const bcrypt = require('bcryptjs');

const password = 'AdminEdifis2025!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Erreur lors du hashage:', err);
        return;
    }
    console.log('Mot de passe:', password);
    console.log('Hash bcrypt:', hash);
});
