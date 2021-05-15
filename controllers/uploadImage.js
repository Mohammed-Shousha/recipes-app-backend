const handleUploadingImage = async (args, client, cloudinary) => {
   const { image, email } = args
   const result = await cloudinary.uploader.upload(image)
   const query = `UPDATE users SET image=$1 WHERE email=$2 RETURNING *`
   const values = [result.secure_url, email]
   const res = await client.query(query, values)
   return res.rows[0]
}

module.exports = handleUploadingImage