import * as Y from "yjs";

const OBSERVE_CELL_ORDER_ARR = false;
const OBSERVE_NOTEBOOK_YMAP = false;
const OBSERVE_CELL_DATA_YMAP = false;
const OBSERVE_CELL_CONTENT_YTEXT = false;

export const yPrettyPrint = (ydoc, msg = "") => {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockJsonData = JSON.stringify({
  notebook: {
    rawCellData: {
      cellIdA: {
        id: "cellIdA",
        content: "console.log('hello i am cell A'); this is templated data",
        type: "code"
      },
      cellIdB: {
        id: "cellIdB",
        content: "console.log('hello i am cell B');",
        type: "code"
      },
      cellIdC: {
        id: "cellIdC",
        content: "console.log('meow (cell 3)');",
        type: "code"
      }
    },
    cellOrderArr: ["cellIdA", "cellIdB", "cellIdC"]
  }
});

const mockCellsDummyData = [
  { id: "cellId1", content: "console.log('cell 1');", type: "code" },
  { id: "cellId2", content: "console.log('cell 2');", type: "code" },
  { id: "cellId3", content: "console.log('cell 3');", type: "code" }
];

export const mockCellsToYDoc = cells => {
  if (!cells) cells = mockCellsDummyData;

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebook");
  if (OBSERVE_NOTEBOOK_YMAP) {
    observability.notebook(yNotebookYMap);
  }

  const cellDataYMap = new Y.Map();
  yNotebookYMap.set("rawCellData", cellDataYMap);
  if (OBSERVE_CELL_DATA_YMAP) {
    observability.cellDataYMap(cellDataYMap);
  }

  for (let cell of cells) {
    const cellBodyYMap = new Y.Map();
    const contentYText = new Y.Text(cell.content);

    if (OBSERVE_CELL_CONTENT_YTEXT) {
      observability.cellContentText(contentYText, cell.id);
    }

    cellBodyYMap.set("id", cell.id);
    cellBodyYMap.set("content", contentYText);
    cellBodyYMap.set("type", cell.type);
    cellDataYMap.set(cell.id, cellBodyYMap);
  }

  console.log("rawCellData populated", JSON.stringify(mockDoc.toJSON()));

  const cellOrderArrYArray = new Y.Array();
  yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);

  if (OBSERVE_CELL_ORDER_ARR) {
    observability.cellOrderArr(cellOrderArrYArray);
  }

  const cellIdArr = cells.map(cell => cell.id);
  cellOrderArrYArray.insert(0, cellIdArr);

  yPrettyPrint(mockDoc, "last print of mockCellsToYDoc function");

  return mockDoc;
};

export const mockJsonToYDoc = json => {
  if (!json) json = mockJsonData;
  json = JSON.parse(json);

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebook");

  if (OBSERVE_NOTEBOOK_YMAP) {
    observability.notebook(yNotebookYMap);
  }

  const cellDataYMap = new Y.Map();
  yNotebookYMap.set("rawCellData", cellDataYMap);

  if (OBSERVE_CELL_DATA_YMAP) {
    observability.cellDataYMap(cellDataYMap);
  }

  for (let entry of Object.entries(json.notebook.rawCellData)) {
    const cellBodyYMap = new Y.Map();
    const contentYText = new Y.Text(entry[1].content);

    if (OBSERVE_CELL_CONTENT_YTEXT) {
      observability.cellContentText(contentYText, cell.id);
    }

    cellBodyYMap.set("id", entry[1].id);
    cellBodyYMap.set("content", contentYText);
    cellBodyYMap.set("type", entry[1].type);
    cellDataYMap.set(entry[0], cellBodyYMap);
  }

  console.log("rawCellData populated", JSON.stringify(mockDoc.toJSON()));

  const cellOrderArrYArray = new Y.Array();
  yNotebookYMap.set("cellOrderArr", cellOrderArrYArray);
  if (OBSERVE_CELL_ORDER_ARR) {
    observability.cellOrderArr(cellOrderArrYArray);
  }

  cellOrderArrYArray.insert(0, json.notebook.cellOrderArr);

  yPrettyPrint(mockDoc, "last print of mockJsonToYDoc function");

  return mockDoc;
};

const observability = {
  cellContentText(contentYText, id) {
    contentYText.observe(event => {
      console.log(
        `Change Detected on cell ${id}  - delta: `,
        event.changes.delta
      );
    });
  },

  cellDataYMap(cellDataYMap) {
    cellDataYMap.observe(event => {
      console.log(
        "\n\nEvent detected on cellDataYMap - delta: ",
        event.changes.delta
      );
    });
  },

  cellOrderArr(cellOrderArrYArray) {
    cellOrderArrYArray.observe(yarrayEvent => {
      console.log(
        "\n\nEvent detected on cellOrderArr - delta: ",
        yarrayEvent.changes.delta
      );
    });
  },

  notebook(notebookYMap) {
    notebookYMap.observeDeep(event => {
      console.log("\n\nEvent fired on notebook ymap: ");
      console.log("==> event path: ", event.path);
      console.log("==> event target: ", event.target);
      console.log("==> event type: ", event.currentTarget);
      // console.log("notebook ymap event", event);
    });
  }
};
