const handleGoogleAuth = async (args, client) => {
   const { name, email, image } = args
   const { rows } = await client.query(`SELECT * FROM users WHERE email='${email}'`)
   if (rows[0]) {
      return rows[0]
   } else {
      const query = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) RETURNING *`
      const values = [name, email, image]
      const res = await client.query(query, values)
      return res.rows[0]
   }
}

module.exports = handleGoogleAuth