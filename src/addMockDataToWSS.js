import * as Y from "yjs";
import { yPrettyPrint, mockJsonToYDoc } from "./mockDataToYDoc.js";

export const yDocWithMockData = config => {
  const docForWSS = config ? new Y.Doc(config) : new Y.Doc();

  mockJsonToYDoc(null, docForWSS);

  return docForWSS;
};

console.log(yDocWithMockData({ gc: true }).toJSON());

export { yPrettyPrint };
