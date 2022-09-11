const handleGoogleAuth = async (args, client) => {
   const { name, email, image } = args
   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   const user = rows[0]

   const recipes_result = await client.query(`SELECT * FROM recipes WHERE user_email='${email}'`)
   const recipes = recipes_result.rows
   
   const fav_recipes_result = await client.query(`SELECT * FROM fav_recipes WHERE user_email='${email}'`)
   const fav_recipes = fav_recipes_result.rows

   const result = {
      ...user,
      recipes,
      fav_recipes
   }

   if (user) {
      return result
   } else {
      const query = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *`
      const values = [name, email, image]
      const res = await client.query(query, values)
      return res.rows[0]
   }
}

module.exports = handleGoogleAuth