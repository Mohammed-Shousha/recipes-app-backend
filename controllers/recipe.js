const { nanoid } = require('nanoid')

const handleAddingRecipe = async (args, client) => {
   const { email, title, time, type, ingredients, directions, image } = args
   const id = nanoid()
   const res = await client.query(`UPDATE users SET recipes=COALESCE(recipes, '[]'::jsonb) ||
      '{
         "id": "${id}",
         "title": "${title}",
         "time": "${time}",
         "type": "${type}",
         "ingredients": "${ingredients}",
         "directions": "${directions}",
         "image": "${image}"
      }'::TEXT ::jsonb
      WHERE email='${email}' RETURNING *`)

   return {
      data: res.rows[0].recipes,
      result: res.rowCount
   }

}

const handleEditingRecipe = async (args, client) => {
   const { email, id, title, time, type, ingredients, directions, image } = args
   const res = await client.query(` 
   WITH recipe_id AS (
      SELECT ('{'||index-1||',title}')::text[] AS title_path,
            ('{'||index-1||',time}')::text[] AS time_path,
            ('{'||index-1||',type}')::text[] AS type_path,
            ('{'||index-1||',ingredients}')::text[] AS ingredients_path,
            ('{'||index-1||',directions}')::text[] AS directions_path,
            ('{'||index-1||',image}')::text[] AS image_path
      FROM users
         ,jsonb_array_elements(recipes) WITH ORDINALITY arr(recipe, index)
      WHERE recipe->>'id' = '${id}'
      AND email = '${email}'
   )
   UPDATE users 
   SET recipes = jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(recipes,
   recipe_id.title_path, '"${title}"', ${false}),
   recipe_id.time_path, '"${time}"', ${false}),
   recipe_id.type_path, '"${type}"', ${false}),
   recipe_id.ingredients_path, '"${ingredients}"', ${false}),
   recipe_id.directions_path, '"${directions}"', ${false}),
   recipe_id.image_path, '"${image}"', ${false})
   FROM recipe_id
   WHERE email = '${email}' RETURNING *`
   )
   return {
      data: res.rows[0].recipes,
      result: res.rowCount
   }
}

const handleDeletingRecipe = async (args, client) => {
   const { email, id } = args
   const res = await client.query(`UPDATE users SET recipes = recipes -
   Cast((SELECT index - 1 FROM users, jsonb_array_elements(recipes) WITH ORDINALITY arr(recipe, index)
   WHERE email='${email}' AND recipe->>'id' = '${id}') AS int)
   WHERE email='${email}' RETURNING *`)

   return {
      data: res.rows[0].recipes,
      result: res.rowCount
   }
}

const handleLikingRecipe = async (args, client) => {
   const { email, id, title, image } = args
   const res = await client.query(`UPDATE users SET fav_recipes=COALESCE(fav_recipes, '[]'::jsonb) ||
      '{
         "id": "${id}",
         "title": "${title}",
         "image": "${image}"
      }'
      ::jsonb
      WHERE email='${email}' RETURNING *`)

   return {
      data: res.rows[0].fav_recipes,
      result: res.rowCount
   }

}

const handleUnlikingRecipe = async (args, client) => {
   const { email, id } = args
   const res = await client.query(`UPDATE users SET fav_recipes = fav_recipes -
   Cast((SELECT index - 1 FROM users, jsonb_array_elements(fav_recipes) WITH ORDINALITY arr(item_object, index)
   WHERE email='${email}' AND item_object->>'id' = '${id}') AS int)
   WHERE email='${email}' RETURNING *`)

   return {
      data: res.rows[0].fav_recipes,
      result: res.rowCount
   }
}

module.exports = {
   handleAddingRecipe,
   handleLikingRecipe,
   handleUnlikingRecipe,
   handleDeletingRecipe,
   handleEditingRecipe
}