import { Server } from "@hocuspocus/server";
import { Doc } from "yjs";
import { Awareness } from "y-protocols/awareness";

import * as Y from "yjs";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { debounce } from "./utils/debounce.js";
import { TiptapTransformer } from "@hocuspocus/transformer";

import { Logger } from "@hocuspocus/extension-logger";
import { mockJsonToYDoc, yPrettyPrint } from "./utils/notebookTemplateJSON.js";

import { Database } from "@hocuspocus/extension-database";
import { s3Client, s3Database } from "./s3client.js";

let count = 0;

const debouncedLogChange = debounce(data => {
  console.log("changed! ", count);
  console.log("logging: ", data);
}, 1000);

const server = Server.configure({
  port: 3000,
  name: "pennant-hocuspocus-provider",

  extensions: [
    // new SQLite({ database: "db.sqlite" }),
    // new Database(s3Database),
    s3Database,
    new Logger({
      onLoadDocument: true,
      onChange: false,
      onConnect: true,
      onDisconnect: false,
      onUpgrade: false,
      onRequest: true,
      onListen: false,
      onDestroy: false,
      onConfigure: false
    })
  ],

  // async connected() {
  //   console.log("connections: 🍉", server.getConnectionsCount());
  // },

  async onChange(data) {
    count++;

    // debouncedLogChange(data.context);
  },

  async onAuthenticate(data) {
    const { token } = data;

    // console.log("token from withing onAuthenticate: ", token);

    // Example test if a user is authenticated with a token passed from the client
    console.log("token: ", token);
    if (token !== "super-secret-token") {
      // console.log("token: ", token);
      throw new Error("Not authorized!");
    }

    // You can set contextual data to use it in other hooks
    return {
      user: {
        id: 1234,
        name: "John was made up in the onAuthenticate hook"
      }
    };
  }

  // if loading template data this will add the content on every refresh
  // ie 2 new cells for every refresh
  // async onLoadDocument(data) {
  //   // mock data interception
  //   const doc = mockJsonToYDoc();
  //   yPrettyPrint(doc, "onLoadDocument: 🍎");
  //   return doc;
  // }
});

server.listen();
