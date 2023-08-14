export const handleAddingRecipe = async (args, client) => {
  const { email, title, time, type, ingredients, directions, image } = args;

  const addRecipeQuery = `INSERT INTO recipes( title, time, type, ingredients, directions, image, user_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const addRecipeValues = [
    title,
    time,
    type,
    ingredients,
    directions,
    image,
    email,
  ];
  const addRecipeResult = await client.query(addRecipeQuery, addRecipeValues);

  const recipesResult = await client.query(
    `SELECT * FROM recipes WHERE user_email=$1`,
    [email]
  );

  const recipes = recipesResult.rows;

  return {
    data: recipes,
    result: addRecipeResult.rowCount,
  };
};

export const handleEditingRecipe = async (args, client) => {
  const { email, id, title, time, type, ingredients, directions, image } = args;

  const updateRecipeQuery = `UPDATE recipes SET title=$1, time=$2, type=$3, ingredients=$4, directions=$5, image=$6 WHERE id=$7 AND user_email=$8 RETURNING *`;
  const updateRecipeValues = [
    title,
    time,
    type,
    ingredients,
    directions,
    image,
    id,
    email,
  ];
  const updateRecipeResult = await client.query(
    updateRecipeQuery,
    updateRecipeValues
  );

  const recipesResult = await client.query(
    `SELECT * FROM recipes WHERE user_email=$1`,
    [email]
  );

  const recipes = recipesResult.rows;

  return {
    data: recipes,
    result: updateRecipeResult.rowCount,
  };
};

export const handleDeletingRecipe = async (args, client) => {
  const { email, id } = args;

  const deleteRecipeQuery = `DELETE FROM recipes WHERE id=$1 AND user_email=$2 RETURNING *`;
  const deleteRecipeValues = [id, email];
  const deleteRecipeResult = await client.query(
    deleteRecipeQuery,
    deleteRecipeValues
  );

  const recipesResult = await client.query(
    `SELECT * FROM recipes WHERE user_email=$1`,
    [email]
  );

  // check if any recipe is deleted (throw error if not)

  const recipes = recipesResult.rows;

  return {
    data: recipes,
    result: deleteRecipeResult.rowCount,
  };
};

export const handleLikingRecipe = async (args, client) => {
  const { email, id, title, image } = args;

  const addFavRecipeQuery = `INSERT INTO fav_recipes(id, title, image, user_email) VALUES ($1, $2, $3, $4) RETURNING *`;
  const addFavRecipeValues = [id, title, image, email];
  const addFavRecipesResult = await client.query(
    addFavRecipeQuery,
    addFavRecipeValues
  );

  const favRecipesResult = await client.query(
    `SELECT * FROM fav_recipes WHERE user_email=$1`,
    [email]
  );

  const favRecipes = favRecipesResult.rows;

  return {
    data: favRecipes,
    result: addFavRecipesResult.rowCount,
  };
};

export const handleUnlikingRecipe = async (args, client) => {
  const { email, id } = args;

  const deleteFavRecipeQuery = `DELETE FROM fav_recipes WHERE id=$1 AND user_email=$2 RETURNING *`;
  const deleteFavRecipeValues = [id, email];
  const deleteFavRecipeResult = await client.query(
    deleteFavRecipeQuery,
    deleteFavRecipeValues
  );

  const favRecipesResult = await client.query(
    `SELECT * FROM fav_recipes WHERE user_email='${email}'`
  );

  const favRecipes = favRecipesResult.rows;

  return {
    data: favRecipes,
    result: deleteFavRecipeResult.rowCount,
  };
};
