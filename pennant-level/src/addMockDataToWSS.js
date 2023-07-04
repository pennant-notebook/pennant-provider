var Y = require("yjs");
var mockDataToYDoc = require("./mockDataToYDoc.js");

exports.addMockData = function (ydoc, config) {
  const docForWSS = mockDataToYDoc.mockJsonToYDoc(null, ydoc);
  return docForWSS;
};

// exports.addMockData = this.addMockData

exports.yPrettyPrint = mockDataToYDoc.yPrettyPrint;

// import * as Y from "yjs";
// import { yPrettyPrint, mockJsonToYDoc } from "./mockDataToYDoc.mjs";

// Object.defineProperty(exports, "__esModule", { value: true });

// const yDocWithMockData = config => {
//   const docForWSS = config ? new Y.Doc(config) : new Y.Doc();

//   mockJsonToYDoc(null, docForWSS);

//   return docForWSS;
// };

// console.log(yDocWithMockData({ gc: true }).toJSON());

// export { yDocWithMockData, yPrettyPrint };
