const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { ApolloServer, gql } = require('apollo-server-express')
const { Pool } = require('pg')
const handleRegister = require('./controllers/register')
const { handleSignIn, handleGoogleSignIn } = require('./controllers/signin')
const { handleAddingRecipe, handleLikingRecipe, handleUnlikingRecipe, handleDeletingRecipe, handleEditingRecipe } = require('./controllers/recipe')
const { handleChangingData, handleChangingPassword } = require('./controllers/profile')

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


   const typeDefs = gql`
      type Query {
         users: [User]   
         user(email: String!): User!
      }

      type User {
         id: ID!
         name: String!
         email: String!
         password: String
         recipes: [Recipe!]
         fav_recipes: [FavRecipe!]
         image: String
      }

      type Recipe {
         id: ID!
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


      type Mutation{
         Register(name: String!, email: String!, password: String!): Result
         SignIn(email: String!, password: String!): Result
         GoogleSignIn(email: String!, name: String!, image: String): User
         AddRecipe(email: String!, title: String!, time: String!, type: String!, ingredients: String!, directions: String!, image: String): UpdatingResult
         DeleteRecipe(email: String!, id: ID!): UpdatingResult
         EditRecipe(email: String!, id: ID!, title: String!, time: String!, type: String!, ingredients: String!, directions: String!, image: String): UpdatingResult
         LikeRecipe(email: String!, id: ID!, title: String!, image: String!): UpdatingResult
         UnlikeRecipe(email: String!, id: ID!): UpdatingResult
         ChangeData(email: String!, name: String!, image: String!): Result
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
         Register: (_, args) => handleRegister(args, client),
         SignIn: (_, args) => handleSignIn(args, client),
         GoogleSignIn: (_, args) => handleGoogleSignIn(args, client),
         AddRecipe: (_, args) => handleAddingRecipe(args, client),
         DeleteRecipe: (_, args) => handleDeletingRecipe(args, client),
         EditRecipe: (_, args) => handleEditingRecipe(args, client),
         LikeRecipe: (_, args) => handleLikingRecipe(args, client),
         UnlikeRecipe: (_, args) => handleUnlikingRecipe(args, client),
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
               return "User"
            }

            if (obj.type) {
               return "Recipe"
            }

            if (obj.id) {
               return "FavRecipe"
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

   let port = process.env.PORT || 5000
   let host = '0.0.0.0'


   await new Promise(resolve => app.listen(port, host , resolve))
   console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`)
   return { server, app }

})().catch(err => console.log(err.stack))
