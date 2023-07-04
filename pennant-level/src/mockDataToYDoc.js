var Y = require("yjs");

const OBSERVE_CELL_ORDER_ARR = false;
const OBSERVE_NOTEBOOK_YMAP = false;
const OBSERVE_CELL_DATA_YMAP = false;
const OBSERVE_CELL_CONTENT_YTEXT = false;

exports.yPrettyPrint = function (ydoc, msg = "") {
  console.log(
    "\n\n==> " + msg + ": \n" + JSON.stringify(ydoc.toJSON(), null, 4) + "\n\n"
  );
};

const mockJsonData = JSON.stringify({
  notebook: {
    rawCellData: {
      cellIdA: {
        id: "cellIdA",
        content: "Fantastic work on the json converter",
        type: "code"
      },
      cellIdB: {
        id: "cellIdB",
        content: "this data was loaded into the websocket provider",
        type: "code"
      },
      cellIdC: {
        id: "cellIdC",
        content: "the current build is loading mock data and collaborative",
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

exports.mockCellsToYDoc = function (cells) {
  if (!cells) cells = mockCellsDummyData;

  const mockDoc = new Y.Doc();
  const yNotebookYMap = mockDoc.getMap("notebookHello");
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

  exports.yPrettyPrint(mockDoc, "last print of mockCellsToYDoc function");

  return mockDoc;
};

exports.mockJsonToYDoc = function (json, yDoc) {
  if (!json) json = mockJsonData;
  json = JSON.parse(json);

  const mockDoc = yDoc ? yDoc : new Y.Doc();
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
      observability.cellContentText(contentYText, entry[1].id);
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

  exports.yPrettyPrint(mockDoc, "last print of mockJsonToYDoc function");

  return mockDoc;
};

const observability = {
  cellContentText: function (contentYText, id) {
    contentYText.observe(event => {
      console.log(
        `Change Detected on cell ${id}  - delta: `,
        event.changes.delta
      );
    });
  },

  cellDataYMap: function (cellDataYMap) {
    cellDataYMap.observe(event => {
      console.log(
        "\n\nEvent detected on cellDataYMap - delta: ",
        event.changes.delta
      );
    });
  },

  cellOrderArr: function (cellOrderArrYArray) {
    cellOrderArrYArray.observe(yarrayEvent => {
      console.log(
        "\n\nEvent detected on cellOrderArr - delta: ",
        yarrayEvent.changes.delta
      );
    });
  },

  notebook: function (notebookYMap) {
    notebookYMap.observeDeep(event => {
      console.log("\n\nEvent fired on notebook ymap: ");
      console.log("==> event path: ", event.path);
      console.log("==> event target: ", event.target);
      console.log("==> event type: ", event.currentTarget);
      // console.log("notebook ymap event", event);
    });
  }
};
