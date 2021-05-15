const handleAddingRecipe = async (args, client, cloudinary) => {
   const { email, title, time, type, ingredients, directions, image } = args
   let result = ''
   if(image){
      result = await cloudinary.uploader.upload(image)
   }else{
      result = {
         secure_url: ''
      }
   }
   const res = await client.query(`UPDATE users SET recipes=COALESCE(recipes, '[]'::jsonb) ||
      '{
         "title": "${title}",
         "time": "${time}",
         "type": "${type}",
         "ingredients": "${ingredients}",
         "directions": "${directions}",
         "image": "${result.secure_url}"
      }'
      ::jsonb
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
   Cast((SELECT position - 1 FROM users, jsonb_array_elements(fav_recipes) with ordinality arr(item_object, position)
   WHERE email='${email}' and item_object->>'id' = '${id}') as int)
   WHERE email='${email}' RETURNING *`)

   return {
      data: res.rows[0].fav_recipes,
      result: res.rowCount
   }
}

module.exports = {
   handleAddingRecipe,
   handleLikingRecipe,
   handleUnlikingRecipe
} 