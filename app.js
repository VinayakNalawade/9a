const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

let db;

app.use(express.json());

//initialize server
const initialize = async () => {
  let dbPath = path.join(__dirname, "userData.db");

  db = await open({ filename: dbPath, driver: sqlite3.Database });

  app.listen(3000, () => console.log("Server is Online"));
};

initialize();

//API 1
app.post("/register/", async (request, response) => {
  let { username, name, password, gender, location } = request.body;

  let userCheck = await db.get(
    `SELECT * FROM user WHERE username = '${username}';`
  );
  if (userCheck === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let hashedPass = await bcrypt.hash(password, 10);
      let query = `INSERT INTO user 
            (username,name,password,gender,location) 
            VALUES ('${username}', '${name}', '${hashedPass}', '${gender}', '${location}');`;

      await db.run(query);

      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//API 2
app.post("/login/", async (request, response) => {
  let { username, password } = request.body;

  let userCheck = await db.get(
    `SELECT * FROM user WHERE username = '${username}';`
  );
  if (userCheck !== undefined) {
    let enPass = await bcrypt.compare(password, userCheck.password);

    if (enPass === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

//API 3
app.put("/change-password/", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  let checkUser = await db.get(
    `SELECT * FROM user WHERE username = '${username}';`
  );

  let enPass = await bcrypt.compare(oldPassword, checkUser.password);

  if (enPass === true) {
    if (newPassword.length > 5) {
      let hashedPass = await bcrypt.hash(newPassword, 10);

      let query = `UPDATE user SET password = '${hashedPass}' WHERE username = '${username}'`;
      await db.run(query);

      response.status(200);
      response.send("Password updated");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});

//module export
module.exports = app;
