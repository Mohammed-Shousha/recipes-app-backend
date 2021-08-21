const handleUploadingImage = async (args, client) => {
   const { image, email } = args
   const query = `UPDATE users SET image=$1 WHERE email=$2 RETURNING *`
   const values = [image, email]
   const res = await client.query(query, values)
   return res.rows[0]
}

module.exports = handleUploadingImage