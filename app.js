// sqlite> select * from todo;
// 1|Learn Node JS|HIGH|IN PROGRESS
// 2|Buy a Car|MEDIUM|TO DO
// 3|Clean the garden|LOW|TO DO
// 4|Play video games|MEDIUM|DONE
// 5|Attend a ceremony|LOW|TO DO
// sqlite>

// create table todo (id INTEGER, todo TEXT, priority TEXT, status TEXT);

// insert into todo(id ,todo, priority, status)
// values
// (1 ,"Learn Node JS", "HIGH","IN PROGRESS"),
// (2,"Buy a Car","MEDIUM","TO DO"),
// (3,"Clean the garden","LOW","TO DO"),
// (4,"Play video games","MEDIUM","DONE"),
// (5 , "Attend a ceremony","LOW","TO DO");

// app.js

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id, //updated
    playerName: dbObject.player_name,
  };
};

const convertDbObjectToResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id, //updated
    playerName: dbObject.player_name,
    totalScore: dbObject.score,
    totalFours: dbObject.fours,
    totalSixes: dbObject.sixes,
  };
};

const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (Request, Response) => {
      console.log("RUNNING SERVER");
    });
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();

// GET API 1

// app.get("/todos/", async (Request, Response) => {
//   const getPlayerQuery1 = `select * from todo`;
//   const getPlayers1 = await db.all(getPlayerQuery1);
//   //   Response.send(
//   //     getPlayers.map((eachPlayer) => convertResponseObject(eachPlayer))
//   //   );
//   Response.send(getPlayers1);
// });

// //GET API 1

// app.get("/todos/", async (Request, Response) => {
//   const {
//     offset,
//     limit,
//     order = "ASE",
//     order_by = "id",
//     search_q = "",
//   } = request.query;
//   const getPlayerQuery2 = `select * from todo where status like '${search_q}' ORDER BY ${order_by} ${order}`;
//   const getPlayers2 = await db.all(getPlayerQuery2);
//   Response.send(getPlayers2);
// });

// //GET API 1

// app.get("/todos/", async (Request, Response) => {
//   const {
//     offset = 0,
//     limit = 0,
//     order = "ASE",
//     order_by = "id",
//     search_q="",
//   } = request.query;
//   const getPlayerQuery3 = `select * from todo
//   where priority LIKE %${search_q}%
//   ORDER BY ${order_by} ${order}
//   LIMIT ${limit} OFFSET ${offset}`;
//   const getPlayers3 = await db.all(getPlayerQuery3);
//   Response.send(getPlayers3);

// });

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// ### API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// ### API 2

app.get("/todos/:todoId/", async (Request, Response) => {
  const { todoId } = Request.params;
  const getPlayerQuery1 = `select * from todo where id=${todoId}`;
  const getPlayers1 = await db.get(getPlayerQuery1);
  //   Response.send(
  //     getPlayers.map((eachPlayer) => convertResponseObject(eachPlayer))
  //   );
  Response.send(getPlayers1);
});

// ### API 3

app.post("/todos/", async (Request, Response) => {
  const { id, todo, priority, status } = Request.body;
  const addTodo = `
    insert into todo(id ,todo, priority, status)
    values(${id},'${todo}','${priority}','${status}');`;
  const getPlayers1 = await db.run(addTodo);
  console.log(getPlayers1);
  Response.send("Todo Successfully Added");
});

// ### API 4

app.put("/todos/:todoId/", async (request, response) => {
  let temp = "";
  const { todoId } = request.params;
  let getTodosQuery = "";
  const todoDetails =  request.body;
  const { todo, priority, status } = todoDetails;
  switch (true) {
    case hasPriorityProperty(todoDetails):
      temp = "Priority Updated";
      getTodosQuery = `
   update todo
    set 
priority = '${priority}'
where id= ${todoId}`;
      break;
    case hasStatusProperty(todoDetails):
      temp = "Status Updated";
      getTodosQuery = `
   update todo
    set 
status = '${status}'
where id= ${todoId}`;
      break;
    default:
      temp = "Todo Updated";
      getTodosQuery = `
   update todo
    set 
todo = '${todo}'
where id= ${todoId}`;
  }
  data = await db.run(getTodosQuery);
  response.send(` ${temp}`);
});

//  API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    delete from todo where id=${todoId}
    `;
  const deleteTodoOne = await db.get(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
