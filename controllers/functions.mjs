export const getUserData = async (client, email) => {
  const userResult = await client.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  const user = userResult.rows[0];

  const recipesResult = await client.query(
    `SELECT * FROM recipes WHERE user_email=$1`,
    [email]
  );

  const recipes = recipesResult.rows;

  const favRecipesResult = await client.query(
    `SELECT * FROM fav_recipes WHERE user_email=$1`,
    [email]
  );

  const favRecipes = favRecipesResult.rows;

  return {
    ...user,
    recipes,
    fav_recipes: favRecipes,
  };
};
