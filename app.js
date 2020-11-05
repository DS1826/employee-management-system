const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Creates connection to mySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "BCSds1826$!",
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
                "View All Departments",
                "View All Roles",
                "Add Employee",
                "Add Department",
                "Add Role",
                "Update Employee Record",
                "EXIT"
            ]

        })
        .then(function (response) {
            if (response.choice === "View All Employees") {
                viewEmployees();
            }
            if (response.choice === "View All Departments") {
                viewDepts();
            }
            if (response.choice === "View All Roles") {
                viewRoles();
            }
            if (response.choice === "Add Employee") {
                addEmployee();
            }
            if (response.choice === "Add Department") {
                addDepartment();
            }
            if (response.choice === "Add Role") {
                addRole();
            }
            if (response.choice === "Update Employee Record") {
                updateEmployee();
            }
            if (response.choice === "EXIT") {
                connection.end();
            }
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

// // Creates Roles Array from database
let rolesList = [];

function getRoles() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            rolesList.push(res[i].title);
        }
    });

    return rolesList;
}

// // Creates Managers Array from database
let managerList = [];

function getManagers() {
    connection.query("SELECT CONCAT(first_name,' ',last_name) AS MANAGER FROM employee WHERE manager_id IS NULL", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {
            managerList.push(res[i].manager);
        }
    });

    return managerList;
}

// View All Employees
function viewEmployees() {
    connection.query(
        "SELECT employee.id, first_name, last_name, title, department.name AS department, salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id"
        , function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// View All Departments
function viewDepts() {
    connection.query(
        "SELECT id, name AS Department FROM department", function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// View All Roles
function viewRoles() {
    connection.query(
        "SELECT role.id, title, salary, name AS department FROM role INNER JOIN department ON role.department_id = department.id", function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// Add Employee - Need to work on Role ID & Manager ID
function addEmployee() {

    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "role",
                type: "list",
                message: "What is the employee's role?",
                choices: getRoles()
            }

        ])
        .then(function (response) {
            let query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, (SELECT id FROM role WHERE title = ?))";

            connection.query(
                query, [response.firstName, response.lastName, response.role], function (err, res) {
                    if (err) throw err;
                    console.log("The new employee has been added");
                    start();
                });

        });
}

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

function updateEmployee() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "rawlist",
                    message: "Select employee to update:",
                    choices: function () {
                        let empList = [];
                        for (let i = 0; i < res.length; i++) {
                            empList.push(res[i].last_name);
                        }
                        return empList;
                    }
                },
                {
                    name: "newTitle",
                    type: "list",
                    message: "Select employee's new role:",
                    choices: getRoles()
                }
            ])
            .then(function (response) {
                let query = "UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE last_name = ?";

                connection.query(
                    query, [response.newTitle, response.employee], function (err, res) {
                        if (err) throw err;
                        console.log("The employee record has been updated");
                        start();
                    });
            });
    });
}


