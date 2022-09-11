const bcrypt = require('bcrypt')

const handleSignIn = async (args, client) => {
   const { email, password } = args
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
      const isValid = await bcrypt.compare(password, user.password)
      if (isValid) {
         return result
      } else {
         return { message: 'Wrong Email or Password' }
      }
   } else {
      return { message: 'Email Not Registered' }
   }
}

module.exports = handleSignIn
