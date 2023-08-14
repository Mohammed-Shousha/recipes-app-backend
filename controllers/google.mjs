import { getUserData } from "./functions.mjs";

export const handleGoogleAuth = async (args, client) => {
  const { name, email, image } = args;

  const userResult = await client.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  const user = userResult.rows[0];

  if (!user) {
    const addUserQuery = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *`;
    const addUserValues = [name, email, image];
    const addUserResult = await client.query(addUserQuery, addUserValues);

    return addUserResult.rows[0];
  }

  return getUserData(client, email);
};
