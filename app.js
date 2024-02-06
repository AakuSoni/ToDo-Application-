const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let database = null;
const initializeDbAndServer = async () => {
    try {
        database = await open({
            filename: databasePath,
            driver: sqlite3.Database
        });

        app.listen(3000, ()=> 
            console.log("Server Running at http://localhost:3000/")
        );
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};
initializeDbAndServer();
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

app.get("/todos/", async (request, response) => {
    let data = null;
    let getToDoQuery = "",
    const { search_q = "", priority, status} = request.query;
    switch (true) {
        case hasPriorityAndStatusProperties(request.query);
        getToDoQuery = `
        SELECT 
        *
        FROM 
        todo 
        WHERE 
        todo LIKE '%${search_q}'
        AND status = '${status}'
        AND Priority = '${priority}';`;
        break;
    case hasPriorityProperty(request.query);
    getToDoQuery =`
    SELECT 
    *
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%'
    AND Priority = '%${priority}%';`;
    break;
    case hasStatusProperty(request.query);
    getToDoQuery= `
    SELECT 
    *
    FROM 
    todo
    WHERE 
    todo LIKE '%${search_q}%'
    AND Status = '%${status}';`;

    break;
    default:
    getToDoQuery = `
    SELECT 
    *
    FROM 
    todo 
    WHERE 
    todo LIKE '%${search_q}%';`;
    
    }

    data = await database.all(getToDoQuery);
    response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
    const {todoId} = request.params;
    const getToDoQuery = `
    SELECT 
    *
    FROM 
    todo
    WHERE 
    id = ${todoId};`;
    const todo = await database.get(getToDoQuery);
    response.send(todo);
});

app.post("/todos/", async (request, response) => {
    const {id, todo, priority, status } = request.body;
    const postToDoQuery = `
    INSERT INTO 
    todo (id, todo, priority, status)
    VALUES
    ('${id}', '${todo}', '${priority}', '${status}');`;
    await database.run(postToDoQuery);
    response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
    const {todoId} = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    switch(true){
        case requestBody.status !== undefined;
        updateColumn = "status";
        break;


        case requestBody.priority !== undefined;
        updateColumn = "priority";
        break;
        case requestBody.todo !== undefined;
        updateColumn = "todo";
        break;
    }

    const previousToDoQuery = `
    SELECT 
    *
    FROM 
    todo 
    WHERE 
    id = ${todoId};`;
    const previousTodo = await database.get(previousToDoQuery);
    const updateTodoQuery = `
    UPDATE 
    todo 
    SET 
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}',
    WHERE 
    id = ${todoId};`;
    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);

});

app.delete("/todos/:todoId", async (request, responses) => {
    const {todoId} = request.params;
    const deleteToDoQuery = `
    DELETE FROM 
    todo 
    WHERE
    id = ${todoId};`;
    await database.run(deleteToDoQuery);
    response.send("Todo Deleted")
});
module.exports = app;















