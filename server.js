const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { ApolloServer, gql } = require('apollo-server-express')
const { Pool } = require('pg')
const handleSignUp = require('./controllers/signup')
const handleSignIn = require('./controllers/signin');
const { handleAddingRecipe, handleLikingRecipe, handleUnlikingRecipe } = require('./controllers/recipe')
const handleUploadingImage = require('./controllers/uploadImage')
const { handleChangingData, handleChangingPassword } = require('./controllers/editProfile')
const cloudinary = require('cloudinary').v2


;
(async () => {
   
   const client = new Pool({
      user: process.env.DBUSER,
      host: process.env.DBHOST,
      database: process.env.DBNAME,
      password: process.env.DBPASSWORD,
      port: process.env.DBPORT,
   })
   await client.connect()

   cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      // shorten: true,
      // secure: true,
      // ssl_detected: true
   })

   // const res = await client.query("SELECT fav_recipes FROM users WHERE email='mo@f.co'")
   // console.log(res.rows[0].fav_recipes[0].id)

   const typeDefs = gql`
      type Query {
         users: [User]   
         user(email: String!): User!
      }

      type User {
         id: ID!
         name: String!
         email: String!
         password: String!
         recipes: [Recipe!]
         fav_recipes: [FavRecipe!]
         image: String
      }

      type Recipe {
         title: String!
         time: Int!
         type: String!
         ingredients: String!
         directions: String!
         image: String
      }

      type FavRecipe {
         id: ID!
         title: String!
         image: String!
      }

      type UpdatingResult {
         data: [Data!]
         result: Int! # 1 "Success"
      }

      type DeletingResult {
         data: [Data!]
         result: Int!
      }

      type Mutation{
         SignUp(name: String!, email: String!, password: String!): Result
         SignIn(email: String!, password: String!): Result
         AddRecipe(email: String!, title: String!, time: String!, type: String!, ingredients: String!, directions: String!, image: String): UpdatingResult
         LikeRecipe(email: String!, id: ID!, title: String!, image: String!): UpdatingResult
         UnlikeRecipe(email: String!, id: ID!): DeletingResult
         UploadImage(email: String!, image: String!): User
         ChangeData(email: String!, name: String!): UpdatingResult
         ChangePassword(email: String!, password: String!, newPassword: String!): Result
      } 

      union Result = User | Error

      union Data = FavRecipe | Recipe | User

      type Error {
        message: String!
      }
   `
      
   const resolvers = {
      Query: {
         users: async() =>{
            const { rows } = await client.query("SELECT * FROM users")
            return rows
         },
         user: async(_, args) => {
            const { rows } = await client.query(`SELECT * FROM users WHERE email='${args.email}'`)
            return rows[0]
         }
      },

      Mutation: {
         SignUp: (_, args) => handleSignUp(args, client),
         SignIn: (_, args) => handleSignIn(args, client),
         AddRecipe: (_, args) => handleAddingRecipe(args, client, cloudinary),
         LikeRecipe: (_, args) => handleLikingRecipe(args, client),
         UnlikeRecipe: (_, args) => handleUnlikingRecipe(args, client),
         UploadImage: (_, args) => handleUploadingImage(args, client, cloudinary),
         ChangeData: (_, args) => handleChangingData(args, client),
         ChangePassword: (_, args) => handleChangingPassword(args, client),
      },

      Result: {
         __resolveType(obj) {
            if (obj.id) {
               return 'User'
            }

            if (obj.message) {
               return 'Error'
            }

            return null
         }
      },

      Data: {
         __resolveType(obj) {
            if (obj.name) {
               return 'User'
            }

            if (obj.id) {
               return 'FavRecipe'
            }

            if (obj.type) {
               return 'Recipe'
            }

            return null
         }
      }

   }
   
   const app = express()
   const server = new ApolloServer({
      typeDefs,
      resolvers,
   })
   await server.start()

   // app.use(cors({
   //    credentials: true,
   //    origin: true
   // }))
   

   app.use(express.json())
   server.applyMiddleware({ app })


   await new Promise(resolve => app.listen({ port: 5000 }, resolve))
   console.log(`Server ready at http://localhost:5000${server.graphqlPath}`)
   return { server, app }

})().catch(err => console.log(err.stack))
