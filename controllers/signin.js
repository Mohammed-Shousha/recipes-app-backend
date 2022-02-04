const bcrypt = require('bcrypt')

const handleSignIn = async (args, client) => {
   const { email, password } = args
   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   // rows[0] === user
   if (rows[0]) {
      const isValid = await bcrypt.compare(password, rows[0].password)
      if (isValid) {
         return rows[0]
      } else {
         return { message: 'Wrong Email or Password' }
      }
   } else {
      return { message: 'Email Not Registered' }
   }
}

const handleGoogleSignIn = async (args, client) => {
   const { name, email, image } = args
   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   if (rows[0]){
      return rows[0]
   } else {
      const query = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *`
      const values = [name, email, image]
      const res = await client.query(query, values)
      return res.rows[0]
   }
}

module.exports = {
   handleSignIn, 
   handleGoogleSignIn
}