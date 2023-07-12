import {
  S3Client,
  ListBucketsCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { Database } from "@hocuspocus/extension-database";
import "dotenv/config";
import { yPrettyPrint, mockJsonToYDoc } from "./utils/notebookTemplateJSON.js";
import * as Y from "yjs";

export const s3Client = new S3Client({
  region: process.env.REGION,
  maxRetries: 15
});

export const s3Database = new Database({
  fetch: async ({ documentName }) => {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: documentName
    });

    let rawBuffer = null;

    try {
      let response = await s3Client.send(command);
      rawBuffer = await response.Body.transformToByteArray();
      console.log("found known notebook -> ", documentName);
    } catch (err) {
      console.log("err", { err });
      if (err["Code"] === "NoSuchKey") {
        console.log(
          "key not found, passing empty uint8array to hp db extention"
        );
      }
    }

    return new Promise((resolve, reject) => {
      if (rawBuffer) {
        resolve(new Uint8Array(rawBuffer));
      } else {
        console.log("attempting fresh ydoc via blank uint8array");
        resolve();
      }
    });
  },

  store: async ({ documentName, state }) => {
    console.log("typeof state", typeof state);
    console.log("state", { state });
    console.log("store from within db extension");
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: documentName,
      Body: state
    });

    return s3Client
      .send(command)
      .then(response => {
        // console.log(response.Body);
      })
      .catch(err => console.error(err));
  }
});
