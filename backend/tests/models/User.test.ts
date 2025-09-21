import User from '../../models/User';

describe('User Model', () => {
  it('devrait avoir les attributs corrects', () => {
    const attributes = User.rawAttributes;

    expect(attributes).toHaveProperty('user_id');
    expect(attributes.user_id.primaryKey).toBe(true);
    expect(attributes.user_id.autoIncrement).toBe(true);

    expect(attributes).toHaveProperty('firstname');
    expect(attributes.firstname.allowNull).toBe(false);

    expect(attributes).toHaveProperty('lastname');
    expect(attributes.lastname.allowNull).toBe(false);

    expect(attributes).toHaveProperty('email');
    expect(attributes.email.allowNull).toBe(false);
    expect(attributes.email.unique).toBe(true);

    expect(attributes).toHaveProperty('password');
    expect(attributes.password.allowNull).toBe(false);
  });

  it('devrait créer un utilisateur', async () => {
    const user = await User.create({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      numberphone: '0123456789',
      password: 'password',
    });
    const userJSON = user.toJSON();
    expect(userJSON.user_id).toBeDefined();
    expect(userJSON.firstname).toBe('Test');
    expect(userJSON.lastname).toBe('User');
    expect(userJSON.email).toBe('test@example.com');
    expect(userJSON.password).toBe('password');
    expect(userJSON.created_at).toBeDefined();
  });

  it('ne devrait pas créer un utilisateur avec un email en double', async () => {
    await User.create({
      firstname: 'Unique',
      lastname: 'User',
      email: 'unique@example.com',
      numberphone: '0987654321',
      password: 'password',
    });

    await expect(
      User.create({
        firstname: 'Duplicate',
        lastname: 'User',
        email: 'unique@example.com',
        numberphone: '0123456789',
        password: 'password',
      }),
    ).rejects.toThrow();
  });
});
