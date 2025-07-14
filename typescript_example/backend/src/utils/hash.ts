import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const cost = await bcrypt.genSalt(10);
  return bcrypt.hash(password, cost);
};

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
