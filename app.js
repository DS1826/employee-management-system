const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Creates connection to mySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "MArion19",
    database: "employee_tracker_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadID + "\n");
    start();
});

function start() {
    inquirer
    .prompt({
        name: "choice",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View all employees"
        ]

    })
    .then(function(response){
        if (response.choice === "View all employees") {
            viewAll();
        }
    });
}

function viewAll() {
    connection.query(
        "SELECT employee.id, first_name, last_name, title, department.name AS department, salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id"
        , function(err, res) {
        if (err) throw err;
        console.table(res);
        start();
        // Use console.table to display results
        // start inquirer again from the top
    });
}

