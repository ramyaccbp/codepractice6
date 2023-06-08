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
//API-1
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
//API-2

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

//API-3
districtConvertDbObjectToResponsiveObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: cases,
    cured: cured,
    active: active,
    deaths: deaths,
  };
};

app.post("/districts", async (request, response) => {
  const queryContent = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = queryContent;
  const postDistrictQuery = `insert in to district(district_name,
    state_id,cases,cured,active,deaths)
    values('${districtName}',
    ${stateId},
${cases},${cured},${active},${deaths});`;
  const addQuery = await db.run(postDistrictQuery);

  const districtId = addQuery.lastId;

  response.send("District Successfully Added");
});

//API4
app.get("districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `select * from district where district_id=${districtId};`;
  const District = await db.get(getDistrictQuery);
  const districtResult = districtConvertDbObjectToResponsiveObject(District);

  response.send(districtResult);
});
module.exports = app;

//API5
app.delete("districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `delete * from district where district_id=${districtId};`;
  await db.run(deleteQuery);
  response.send("District Removed");
});

//API6 update details
app.put("districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrict = `update district set 
    district_name='${districtName}',
    state_id='${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    where district_id=districtId;`;
  await db.run(updateDistrict);
  response.send("District Details Updated");
});
