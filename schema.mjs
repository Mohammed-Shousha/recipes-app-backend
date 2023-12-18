import client from "./db.mjs";

import { handleRegister } from "./controllers/register.mjs";
import { handleSignIn } from "./controllers/signin.mjs";
import { handleGoogleAuth } from "./controllers/google.mjs";
import {
  handleAddingRecipe,
  handleLikingRecipe,
  handleUnlikingRecipe,
  handleDeletingRecipe,
  handleEditingRecipe,
} from "./controllers/recipe.mjs";

import {
  handleChangingData,
  handleChangingPassword,
} from "./controllers/profile.mjs";

import { getUserData } from "./controllers/functions.mjs";

export const typeDefs = `#graphql
    type Query {
      users: [User]
      user(email: String!): User!
      recipes: [Recipe!]
      favRecipes(email: String!): [FavRecipe!]
    }

    type User {
      id: ID!
      name: String!
      email: String!
      password: String
      recipes: [Recipe!]
      favRecipes: [FavRecipe!]
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

    type UpdatingResult { # replace it with Result data | error
      data: [Data!]
      result: Int! # 1 "Success"
    } 

    type Mutation {
      Register(name: String!, email: String!, password: String!): Result
      SignIn(email: String!, password: String!): Result
      GoogleAuth(email: String!, name: String!, image: String): User
      AddRecipe(
        email: String!
        title: String!
        time: Int!
        type: String!
        ingredients: String!
        directions: String!
        image: String
      ): UpdatingResult
      DeleteRecipe(email: String!, id: ID!): UpdatingResult
      EditRecipe(
        email: String!
        id: ID!
        title: String!
        time: Int!
        type: String! # make enum of types
        ingredients: String!
        directions: String!
        image: String
      ): UpdatingResult
      LikeRecipe(
        email: String!
        id: ID!
        title: String!
        image: String!
      ): UpdatingResult
      UnlikeRecipe(email: String!, id: ID!): UpdatingResult
      ChangeData(email: String!, name: String!, image: String): Result
      ChangePassword(
        email: String!
        password: String!
        newPassword: String!
      ): Result
    }

    union Result = User | Error

    union Data = FavRecipe | Recipe | User

    type Error {
      message: String!
    }
  `;

export const resolvers = {
  Query: {
    users: async () => {
      const usersResult = await client.query("SELECT * FROM users");
      return usersResult.rows;
    },
    user: async (_, args) => {
      const result = getUserData(client, args.email);
      return result;
    },
    recipes: async () => {
      const recipesResult = await client.query("SELECT * FROM recipes");
      return recipesResult.rows;
    },
    favRecipes: async (_, args) => {
      const favRecipesResult = await client.query(
        `SELECT * FROM fav_recipes WHERE user_email = '${args.email}'`
      );
      return favRecipesResult.rows;
    },
  },

  Mutation: {
    Register: (_, args) => handleRegister(args, client),
    SignIn: (_, args) => handleSignIn(args, client),
    GoogleAuth: (_, args) => handleGoogleAuth(args, client),
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
        return "User";
      }

      if (obj.message) {
        return "Error";
      }

      return null;
    },
  },

  Data: {
    __resolveType(obj) {
      if (obj.name) {
        return "User";
      }

      if (obj.type) {
        return "Recipe";
      }

      if (obj.id) {
        return "FavRecipe";
      }

      return null;
    },
  },
};
