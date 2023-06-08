const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "covid19India.db");
const app = express();

let db = null;
initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server has Started");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
app.get("/states/", async (request, response) => {
  const convertDbObjectToResponsiveObject = (dbObject) => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.state_name,
      population: dbObject.population,
    };
  };
  const getStatesQuery = `select * from state;`;

  const statesList = await db.all(getStatesQuery);
  response.send(
    statesList.map((eachState) => convertDbObjectToResponsiveObject(eachState))
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `select 
     *
     from
      state
       where state_id=${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});
module.exports = app;
