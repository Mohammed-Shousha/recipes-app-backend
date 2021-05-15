const bcrypt = require('bcrypt')
const saltRounds = 10

const handleSignUp = async (args, client) =>{
   const { name, email, password } = args

   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   if (rows[0]) return { message: "This Email Already Have an Account Linked to It"}

   const hash = await bcrypt.hash(password, saltRounds)

   const query = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`
   const values = [name, email, hash]
   const res = await client.query(query, values)
   return res.rows[0]
}

module.exports = handleSignUp