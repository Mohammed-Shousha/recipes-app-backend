import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { getUserData } from "./functions.mjs";

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);

export const handleChangingData = async (args, client) => {
  const { email, name, image } = args;

  const updateUserDataQuery = `UPDATE users SET name=$1, image=$3 WHERE email=$2`;
  const updateUserDataValues = [name, email, image];
  const updateUserDataResult = await client.query(
    updateUserDataQuery,
    updateUserDataValues
  );

  if (updateUserDataResult.rowCount !== 1) {
    return { message: "Couldn't Update Data" };
  }

  return getUserData(client, email);
};

export const handleChangingPassword = async (args, client) => {
  const { email, password, newPassword } = args;

  const userResult = await client.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  const user = userResult.rows[0];

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) return { message: "Wrong Password" };

  if (password === newPassword)
    return { message: "You Need to Write a New Password" };

  const hash = await bcrypt.hash(newPassword, saltRounds);

  const updatePasswordQuery = `UPDATE users SET password=$1 WHERE email=$2`;
  const updatePasswordValues = [hash, email];
  const updatePasswordResult = await client.query(
    updatePasswordQuery,
    updatePasswordValues
  );

  if (updatePasswordResult.rowCount !== 1) {
    return { message: "Couldn't Update Password" };
  }

  return getUserData(client, email);
};
