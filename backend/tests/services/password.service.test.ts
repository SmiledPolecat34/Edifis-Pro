import { validatePolicy, hash, compare } from '../../services/password.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('Password Service', () => {
  describe('validatePolicy', () => {
    it('devrait retourner ok: true pour un mot de passe fort', () => {
      const result = validatePolicy('StrongPassword123!');
      expect(result.ok).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('devrait retourner ok: false et des erreurs pour un mot de passe trop court', () => {
      const result = validatePolicy('Short1!');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 12 caractères');
    });

    it('devrait retourner ok: false et des erreurs pour un mot de passe sans majuscule', () => {
      const result = validatePolicy('strongpassword123!');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
    });

    it('devrait retourner ok: false et des erreurs pour un mot de passe sans minuscule', () => {
      const result = validatePolicy('STRONGPASSWORD123!');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
    });

    it('devrait retourner ok: false et des erreurs pour un mot de passe sans chiffre', () => {
      const result = validatePolicy('StrongPassword!!');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
    });

    it('devrait retourner ok: false et des erreurs pour un mot de passe sans caractère spécial', () => {
      const result = validatePolicy('StrongPassword123');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain(
        'Le mot de passe doit contenir au moins un caractère spécial',
      );
    });

    it('devrait retourner toutes les erreurs pour un mot de passe faible', () => {
      const result = validatePolicy('short');
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBe(4);
    });
  });

  describe('hash', () => {
    it('devrait hacher le mot de passe', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      const hashedPassword = await hash('plainPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', expect.any(Number));
      expect(hashedPassword).toBe('hashedPassword123');
    });
  });

  describe('compare', () => {
    it('devrait comparer le mot de passe avec succès', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await compare('plainPassword', 'hashedPassword123');
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword123');
      expect(result).toBe(true);
    });

    it('devrait échouer la comparaison du mot de passe', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await compare('wrongPassword', 'hashedPassword123');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword123');
      expect(result).toBe(false);
    });
  });
});
