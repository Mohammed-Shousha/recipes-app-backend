import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = parseInt(process.env.SALT_ROUNDS);

export const handleRegister = async (args, client) => {
  const { name, email, password } = args;

  const userResult = await client.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  const user = userResult.rows[0];

  if (user)
    return { message: "This Email Already Have an Account Linked to It" };

  const hash = await bcrypt.hash(password, saltRounds);

  const addUserQuery = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  const addUserValues = [name, email, hash];
  const addUserResult = await client.query(addUserQuery, addUserValues);

  return addUserResult.rows[0];
};
