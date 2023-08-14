import bcrypt from "bcrypt";
import { getUserData } from "./functions.mjs";

export const handleSignIn = async (args, client) => {
  const { email, password } = args;

  const userResult = await client.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  const user = userResult.rows[0];

  if (!user) return { message: "Wrong Email or Password" };

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) return { message: "Wrong Email or Password" };

  return getUserData(client, email);
};
