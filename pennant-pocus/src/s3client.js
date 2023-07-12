import {
  S3Client,
  ListBucketsCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsCommand
} from "@aws-sdk/client-s3";
import { Database } from "@hocuspocus/extension-database";
import "dotenv/config";
import { yPrettyPrint, mockJsonToYDoc } from "./utils/notebookTemplateJSON.js";
import * as Y from "yjs";

export const s3Client = new S3Client({
  region: process.env.REGION,
  maxRetries: 15
});

/////////////////////// view all objeccs in bucket ///////////////////////

const objInput = {
  Bucket: process.env.BUCKET_NAME
};
const objCommand = new ListObjectsCommand(objInput);
const objReponse = await s3Client
  .send(objCommand)
  .then(res => console.log(res));

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
const command = new GetObjectCommand({
  Bucket: process.env.BUCKET_NAME,
  Key: "hardcodeupload_whole_y_doc"
});

s3Client.send(command).then(response => {
  console.log(
    response.Body.transformToByteArray().then(res => console.log(res))
  );
});
//////////////////////////////////////////////////////////////////////

// doSomething()
//   .then(result => doSomethingElse(result))
//   .then(newResult => doThirdThing(newResult))
//   .then(finalResult => {
//     console.log(`Got the final result: ${finalResult}`);
//   })
//   .catch(failureCallback);

export const s3Database = new Database({
  // Return a Promise to retrieve data …
  fetch: async ({ documentName }) => {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: documentName
    });

    return s3Client
      .send(command)
      .then(response => {
        console.log(response.Body);
      })
      .catch(err => console.error(err));

    // try {
    //   const response = await client.send(command);
    //   // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    //   const yDocBinaryArr = await response.Body.transformToByteArray();
    //   console.log(str);
    // } catch (err) {
    //   console.error(err);
    // }

    // return s3Client.send(command).then((resolve, reject) => {
    //   // return new Promise((resolve, reject) => {
    // });
  },
  // … and a Promise to store data:
  store: async ({ documentName, state }) => {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: documentName,
      Body: state
    });

    return s3Client
      .send(command)
      .then(response => {
        console.log(response.Body);
      })
      .catch(err => console.error(err));
    // this.db?.run(
    //   `
    //       INSERT INTO "documents" ("name", "data") VALUES ($name, $data)
    //         ON CONFLICT(name) DO UPDATE SET data = $data
    //     `,
    //   {
    //     $name: documentName,
    //     $data: state
    //   }
    // );
  }
});

function createNotebook(notebookName, userName) {
  notebookName = notebookName.trim();
  if (!notebookName) {
    return alert(
      "Notebook names must contain at least one non-space character."
    );
  }
  if (notebookName.indexOf("/") !== -1) {
    return alert("Notebook names cannot contain slashes.");
  }
  // key should probably come from the app
  var notebookKey = encodeURIComponent(notebookName);
  s3.headObject({ Key: notebookKey }, function (err, data) {
    if (!err) {
      return alert("notebook already exists.");
    }
    if (err.code !== "NotFound") {
      return alert("There was an error creating your notebook: " + err.message);
    }
    s3.putObject({ Key: notebookKey }, function (err, data) {
      if (err) {
        return alert(
          "There was an error creating your notebook: " + err.message
        );
      }
      alert("Successfully created notebook.");
      // viewnotebook(notebookKey);
    });
  });
}
