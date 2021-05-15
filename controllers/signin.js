const bcrypt = require('bcrypt')

const handleSignIn = async (args, client) => {
   const { email, password } = args
   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   // rows[0] is the user data
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

module.exports = handleSignIn