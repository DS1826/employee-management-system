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
    console.log("Connected as id " + connection.threadId);
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
                "Update Employee Role",
                "Update Employee Manager",
                "Delete Employee",
                "Delete Department",
                "Delete Role",
                "EXIT"
            ]

        })
        .then(function (response) {

            switch (response.choice) {
                case "View All Employees":
                    viewEmployees();
                    break;
                case "View All Departments":
                    viewDepts();
                    break;
                case "View All Roles":
                    viewRoles();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Update Employee Role":
                    updateEmployee();
                    break;
                case "Update Employee Manager":
                    updateManager();
                    break;
                case "Delete Employee":
                    deleteEmployee();
                    break;
                case "Delete Department":
                    deleteDept();
                    break;
                case "Delete Role":
                    deleteRole();
                    break;
                case "EXIT":
                    connection.end();
                    break;
                default:
                    connection.end();
                    break;
            }
        });
}

// Creates Department Array from database
let deptList = [];

function getDepts() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {

            let deptData = { 
                name: res[i].name,
                value: res[i].id
            }
            deptList.push(deptData);
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
            
            let roleData = { 
                name: res[i].title,
                value: res[i].id
            }
            
            rolesList.push(roleData);
        }
    });

    return rolesList;
}

// // Creates Managers Array from database
let managerList = [];

function getManagers() {
    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function (err, res) {
        if (err) throw err
        for (let i = 0; i < res.length; i++) {

            let mgrData = { 
                name: res[i].first_name + " " + res[i].last_name,
                value: res[i].id
            }
            managerList.push(mgrData);
        }
    });

    return managerList;
}

// View All Employees
function viewEmployees() {
    let query = "SELECT first_name, last_name, title, department.name AS department, salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id"

    connection.query(query, function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// View All Departments
function viewDepts() {
    connection.query(
        "SELECT name AS Department FROM department", function (err, res) {
            if (err) throw err;
            console.table(res);
            start();
        });
}

// View All Roles
function viewRoles() {
    connection.query(
        "SELECT title, salary, name AS department FROM role INNER JOIN department ON role.department_id = department.id", function (err, res) {
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
            let query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)";

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

            let query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE id = ?))";

            connection.query(
                query, [response.newRole, response.newSalary, response.dept], function (err, res) {
                    if (err) throw err;
                    console.log("The new role has been created");
                    start();
                });
        });

}

// Update Employee Role
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
                            
                            let newEmp = { 
                                name: res[i].first_name + " " + res[i].last_name,
                                value: res[i].id
                            }
                            empList.push(newEmp);
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
                let query = "UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE id = ?";

                connection.query(
                    query, [response.newTitle, response.employee], function (err, res) {
                        if (err) throw err;
                        console.log("The employee's role has been updated");
                        start();
                    });
            });
    });
}

// Refer to Update Employee to create object in choices
function updateManager() {
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

                            let empData = {
                                name: res[i].first_name + " " + res[i].last_name,
                                value: res[i].id
                            }
                            empList.push(empData);
                        }
                        return empList;
                    }
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Select the employee's manager:",
                    choices: getManagers()
                }
            ])
            .then(function (response) {

                let query = "UPDATE employee SET manager_id = ? WHERE id = ?";

                connection.query(
                    query, [response.manager, response.employee], function (err, res) {
                        if (err) throw err;
                        console.log("The employee's manager has been updated");
                        start();
                    });
            });
    });
}

function deleteEmployee() {
    connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "rawlist",
                    message: "Select employee to delete:",
                    choices: function () {
                        let empList = [];
                        for (let i = 0; i < res.length; i++) {

                            let empData = {
                                name: res[i].first_name + " " + res[i].last_name,
                                value: res[i].id
                            }
                            empList.push(empData);
                        }
                        return empList;
                    }
                }
            ])
            .then(function (response) {
                let query = "DELETE FROM employee WHERE id = ?";

                connection.query(
                    query, [response.employee], function (err, res) {
                        if (err) throw err;
                        console.log("The employee has been deleted");
                        start();
                    });
            });
    });
}

function deleteDept() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "department",
                    type: "rawlist",
                    message: "Select department to delete:",
                    choices: function () {
                        let deptList = [];
                        for (let i = 0; i < res.length; i++) {

                            let deptData = {
                                name: res[i].name,
                                value: res[i].id
                            }

                            deptList.push(deptData);
                        }
                        return deptList;
                    }
                }
            ])
            .then(function (response) {
                let query = "DELETE FROM department WHERE id = ?";

                connection.query(
                    query, [response.department], function (err, res) {
                        if (err) throw err;
                        console.log("The department has been deleted");
                        start();
                    });
            });
    });
}

function deleteRole() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "role",
                    type: "rawlist",
                    message: "Select role to delete:",
                    choices: function () {
                        let roleList = [];
                        for (let i = 0; i < res.length; i++) {

                            let roleData = {
                                name: res[i].title,
                                value: res[i].id
                            }
                            roleList.push(roleData);
                        }
                        return roleList;
                    }
                }
            ])
            .then(function (response) {
                let query = "DELETE FROM role WHERE id = ?";

                connection.query(
                    query, [response.role], function (err, res) {
                        if (err) throw err;
                        console.log("The role has been deleted");
                        start();
                    });
            });
    });
}