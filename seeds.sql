USE employee_tracker_db;

-- add test values for DEPT, EMPL & ROLE Tables

INSERT INTO department (name) 
VALUES ("Sales"), ("Marketing"), ("Engineering"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Director", 2000000, 1), ("Consultant", 100000, 1), ("Marketing Director", 1000000, 2), ("Marketing Associate", 80000, 2), ("Senior Engineer", 150000, 3), ("Junior Developer", 80000, 3), ("Attorney", 200000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jane", "MacIntyre", 1, null), ("Julian", "Bedford", 2, 1), ("Joe", "Green", 3, null), ("Julia", "Wright", 4, 3), ("John", "Stanford", 5, null), ("Jeanne", "Gray", 6, 5), ("Jennifer", "Long", 7, null);