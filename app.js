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

// Connection ID
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadID);
    start();
});

// Starts user database query
function start() {
    inquirer
        .prompt({
            name: "choice",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View All Employees By Department",
                "Add Department",
                "Add Role"
            ]

        })
        .then(function (response) {
            if (response.choice === "View All Employees") {
                viewAll();
            }
            if (response.choice === "View All Employees By Department") {
                viewByDept();
            }
            if (response.choice === "Add Department") {
                addDepartment();
            }
            if (response.choice === "Add Role") {
                addRole();
            }
        });
}

// View All Employees
function viewAll() {
    connection.query(
        "SELECT employee.id, first_name, last_name, title, department.name AS department, salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id"
        , function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// View All Employees by Department
function viewByDept() {
    inquirer
        .prompt({
            name: "byDepartment",
            type: "list",
            message: "Which department would you like to view?",
            choices: [
                "Sales",
                "Marketing",
                "Engineering",
                "Legal"
            ]

        })
        .then(function (response) {
            connection.query(
                "SELECT employee.id, CONCAT(first_name,' ',last_name) AS employee, title from employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = ?", [response.byDepartment], function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    start();
                });
        });
}

// Add Employee - Need to work on Role ID & Manager ID
// function addEmployee() {

//     inquirer
//     .prompt([
//         {
//         name: "firstName",
//         type: "input",
//         message: "What is the employee's first name?"
//         },
//         {
//             name: "firstName",
//             type: "input",
//             message: "What is the employee's first name?"
//         },
//         {
//             name: "role",
//             type: "list",
//             message: "What is the employee's role?",
//             choices: [
//                 "Consultant",
//                 "Marketing Associate",
//                 "Junior Developer",
//                 "Legal Assistant"
//             ]
//         },
//         {
//             name: "manager",
//             type: "list",
//             message: "Who is the employee's manager?",
//             choices: [
//                 "None",
//                 "Jane MacIntyre",
//                 "Joe Green",
//                 "John Stanford",
//                 "Jennifer Long"
//             ]
//         },

//     ])
//     .then(function(response){
//         connection.query(
//             "SELECT employee.id, CONCAT(first_name,' ',last_name) AS employee, title from employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = ?", [response.byDepartment], function(err, res) {
//             if (err) throw err;
//             console.table(res);
//             start();
//         });
//     });
// }

// Add Department
function addDepartment() {
    inquirer
        .prompt({
            name: "newDept",
            type: "input",
            message: "Which department would you like to add?"
        })
        .then(function (response) {
            connection.query(
                "INSERT INTO department (name) VALUES (?)", [response.newDept], function (err, res) {
                    if (err) throw err;
                    console.log("The following department has been created: " + [response.newDept]);
                    start();
                });
        });
}

// Creates Department Array from database
let deptList = [];

function getDepts() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            deptList.push(res[i].name);
        }
    });
    
    return deptList;
}

// Add Role
function addRole() {
    
        inquirer
            .prompt([
                {
                    name: "newRole",
                    type: "input",
                    message: "What role would you like to add?"
                },
                {
                    name: "newSalary",
                    type: "number",
                    message: "What is the salary for this new role?"
                },
                {
                    name: "dept",
                    type: "list",
                    message: "Pick a department for this new role:",
                    choices: getDepts()
                }
            ])
            .then(function (response) {

                let query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE name = ?))";

                connection.query(
                    query, [response.newRole, response.newSalary, response.dept], function (err, res) {
                        if (err) throw err;
                        console.log("The new role has been created");
                        start();
                    });
            });
}

