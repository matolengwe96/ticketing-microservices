import bcrypt from 'bcrypt';

export class Password {
  static async toHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    return bcrypt.compare(suppliedPassword, storedPassword);
  }
}