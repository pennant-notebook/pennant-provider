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

/////////////////////// view all objects in bucket ///////////////////////

// const objInput = {
//   Bucket: process.env.BUCKET_NAME
// };
// const objCommand = new ListObjectsCommand(objInput);
// const objReponse = await s3Client
//   .send(objCommand)
//   .then(res => console.log(res));

//////////////////////////////////////////////////////////////////////

/////////////////////// hardcode send to s3 ///////////////////////

// const input = {
//   Body: Y.encodeStateAsUpdate(mockJsonToYDoc()),
//   Bucket: process.env.BUCKET_NAME,
//   Key: "hardcodeupload_whole_y_doc",
//   Metadata: {
//     metadata1: "value1",
//     metadata2: "value2"
//   }
// };
// const command = new PutObjectCommand(input);
// const response = await s3Client.send(command);

//////////////////////////////////////////////////////////////////////

////////////////////// hardcode get from s3 /////////////////////////
// const command = new GetObjectCommand({
//   Bucket: process.env.BUCKET_NAME,
//   Key: "YrNU7t"
// });

// s3Client
//   .send(command)
//   .then(response => {
//     // an existing ydoc
//     console.log(response.httpStatusCode);
//     console.log(
//       response.Body.transformToByteArray().then(res => {
//         console.log(res);
//         const doc = new Y.Doc();
//         Y.applyUpdate(doc, res);
//         console.log(doc.toJSON());
//       })
//     );
//   })
//   .catch(err => {
//     // a new ydoc
//     console.log("an error has occured");
//     console.log("err", { err });
//     console.log("err.code", err["Code"]);
//     console.error(err);
//   });
//////////////////////////////////////////////////////////////////////

// doSomething()
//   .then(result => doSomethingElse(result))
//   .then(newResult => doThirdThing(newResult))
//   .then(finalResult => {
//     console.log(`Got the final result: ${finalResult}`);
//   })
//   .catch(failureCallback);

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
