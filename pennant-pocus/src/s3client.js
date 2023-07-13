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
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  maxRetries: 15
});

console.log("process.env.AWS_REGION", process.env.AWS_REGION);

export const s3Database = new Database({
  fetch: async ({ documentName }) => {
    console.log("awsregion", process.env.AWS_REGION);
    console.log("AWS_PROFILE", process.env.AWS_PROFILE);
    console.log("bucket_name", process.env.BUCKET_NAME);
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
    // console.log("typeof state", typeof state);
    // console.log("state", { state });
    console.log("\n\nstore from within db extension");
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: documentName,
      Body: state
    });

    // try {
    //   let response = await s3Client.send(command);
    //   console.log("response from s3Client.send(command)", response);
    // } catch (err) {
    //   console.log("err sending during db store ext", { err });
    // }

    return s3Client.send(command).catch(err => {
      console.log("error during store cycle =>");
      console.error(err);
    });
  }
});
