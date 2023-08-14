import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { typeDefs, resolvers } from "./schema.mjs";

dotenv.config();

try {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));
  // app.use(express.json());

  const port = process.env.PORT || 7000;
  const host = "0.0.0.0";

  await new Promise((resolve) => app.listen(port, host, resolve));
  console.log(`Server ready at http://localhost:${port}/graphql`);
} catch (err) {
  console.log(err);
}
