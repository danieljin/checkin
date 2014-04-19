// web.js
var express = require("express");
var logfmt = require("logfmt");
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var validator = require('validator');
var sql = require("mssql");
var config = {
    user: '******',
    password: '******',
    server: '******',
    database: '******'
};
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

app.use(cookieParser());
app.use(session({
    secret: '******'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(logfmt.requestLogger());
// checks if a user is authorized

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    } else {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    }
}
// connect to the mssql database
sql.connect(config, function(err) {
    var request = new sql.Request();
    // allow cross origin scripting.
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:8888");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.header('Access-Control-Allow-Credentials', 'true');
        if ('OPTIONS' == req.method) {
            res.send(200);
        } else {
            next();
        }
    });
    // function to check if logged in user is a leader

    function checkLeader(req, res, next) {
        if (!req.session.user_id) {
            res.send(401, 'Unauthorized');
        } else {
            request.query("Select * from leaders where userID = '" + req.session.user_id + "'", function(err, recordset) {
                if (err) {
                    res.send(400, err);
                } else if (recordset[0]) {
                    next();
                } else {
                    res.send(401, 'Not authorized');
                }
            });
        }
    }
/* ------------------------------- Get Requests ----------------------------- */
    app.get('/login', function(req, res) {
        var email = validator.toString(req.query.email),
            password = validator.toString(req.query.password);
        request.query("Select userID, password from users where email = '" + email + "'", function(err, recordset) {
            if (!err) {
                var result = recordset[0];
                if (result) {
                    bcrypt.compare(password, result.password, function(err, correct) {
                        if (correct) {
                            req.session.user_id = result.userID;
                            //res.redirect('/index.html');
                            res.send('Successful login');
                        } else {
                            res.send(401, 'Bad username/pass');
                        }
                    });
                } else {
                    res.send(401, 'Bad username/pass');
                }
            } else {
                res.send(400, err);
            }
        });
    });
    app.get('/logout', function(req, res) {
        req.session.user_id = null;
        res.send('Successful logout');
    });
    app.get('/isloggedin', function(req, res) {
        if (req.session.user_id != null) {
            res.send(200, 'Logged in.');
        } else {
            res.send(200, 'Not logged in.');
        }
    });
    app.get('/user/:id', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select users.userID,users.fname,users.lname,users.address,users.city,users.state,users.email,CASE WHEN users.marital = 1 THEN 'Single' WHEN users.marital = 2 THEN 'Married' WHEN users.marital = 3 THEN 'Widowed' ELSE 'Divorced' END AS marital,CASE WHEN users.gender = 0 THEN 'Male' ELSE 'Female' END AS gender,convert(varchar(20),birthdate,111) as birthdate,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID where users.userID = '" + userID + "'", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                res.send(recordset[0]);
            } else {
                res.send(404, 'No user with that ID.');
            }
        });
    });
    app.get('/user', checkAuth, function(req, res) {
        request.query("Select userID,users.fname,users.lname,users.email,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID where users.userID = '" + req.session.user_id + "'", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                res.send(recordset[0]);
            } else {
                res.send(404, 'No user with that ID.');
            }
        });
    });
    app.get('/users', checkAuth, function(req, res) {
        request.query("Select users.userID,users.fname,users.lname,users.address,users.city,users.state,users.email,CASE WHEN users.marital = 1 THEN 'Single' WHEN users.marital = 2 THEN 'Married' WHEN users.marital = 3 THEN 'Widowed' ELSE 'Divorced' END AS marital,CASE WHEN users.gender = 0 THEN 'Male' ELSE 'Female' END AS gender,convert(varchar(20),birthdate,111) as birthdate,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/users/group/:groupID', checkAuth, function(req, res) {
        var groupID = validator.toInt(req.params.groupID);
        request.query("Select users.userID,users.fname,users.lname,users.address,users.city,users.state,users.email,CASE WHEN users.marital = 1 THEN 'Single' WHEN users.marital = 2 THEN 'Married' WHEN users.marital = 3 THEN 'Widowed' ELSE 'Divorced' END AS marital,CASE WHEN users.gender = 0 THEN 'Male' ELSE 'Female' END AS gender,convert(varchar(20),birthdate,111) as birthdate,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID where users.groupID=" + groupID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/users/event/:eventID', checkAuth, function(req, res) {
        var eventID = validator.toInt(req.params.eventID);
        request.query("Select groupID from users where userID=" + req.session.user_id, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                var groupID = recordset[0].groupID;
                request.query("Select users.userID,(users.fname+' '+users.lname) as name, signups.present from users INNER JOIN signups ON users.userID=signups.userID where signups.eventID=" + eventID + " and users.groupID=" + groupID, function(err, recordset) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.send(recordset);
                    }
                });
            } else {
                res.send(409, "User could not be found");
            }
        });
    });
    app.get('/users/:userID', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.userID);
        request.query("Select groupID from leaders where userID=" + userID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                request.query("Select users.userID,users.fname,users.lname,users.address,users.city,users.state,users.email,CASE WHEN users.marital = 1 THEN 'Single' WHEN users.marital = 2 THEN 'Married' WHEN users.marital = 3 THEN 'Widowed' ELSE 'Divorced' END AS marital,CASE WHEN users.gender = 0 THEN 'Male' ELSE 'Female' END AS gender,convert(varchar(20),birthdate,111) as birthdate,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID where users.groupID=" + groupID, function(err, recordset) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.send(recordset);
                    }
                });
            } else {
                res.send(404, 'User is not a leader.');
            }
        });
    });
    app.get('/myusers', checkAuth, function(req, res) {
        var userID = req.session.user_id;
        request.query("Select groupID from leaders where userID=" + userID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                request.query("Select users.userID,users.fname,users.lname,users.address,users.city,users.state,users.email,CASE WHEN users.marital = 1 THEN 'Single' WHEN users.marital = 2 THEN 'Married' WHEN users.marital = 3 THEN 'Widowed' ELSE 'Divorced' END AS marital,CASE WHEN users.gender = 0 THEN 'Male' ELSE 'Female' END AS gender,convert(varchar(20),birthdate,111) as birthdate,groups.groupName from users INNER JOIN groups ON users.groupID=groups.groupID where users.groupID=" + recordset[0].groupID, function(err, recordset) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.send(recordset);
                    }
                });
            } else {
                res.send(404, 'User is not a leader.');
            }
        });
    });
    app.get('/nonleaders', checkAuth, function(req, res) {
        request.query("Select users.userID,users.fname,users.lname from users LEFT JOIN leaders ON users.userID = leaders.userID where leaders.userID is null", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/group/:id', checkAuth, function(req, res) {
        var groupID = validator.toInt(req.params.id);
        request.query("Select * from groups where groupID = '" + groupID + "'", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                res.send(recordset[0]);
            } else {
                res.send(404, 'No group with that ID.');
            }
        });
    });
    app.get('/groups', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select * from groups", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/event/:id', checkAuth, function(req, res) {
        var eventID = validator.toInt(req.params.id);
        request.query("Select eventID, eventname, CASE WHEN type = 1 THEN 'Seminar' WHEN type = 2 THEN 'Class' ELSE 'Workshop' END AS type, convert(varchar(20),date,111) as date from events where eventID = '" + eventID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else if (recordset[0]) {
                res.send(recordset[0]);
            } else {
                res.send(404, 'No event with that ID.');
            }
        });
    });
    app.get('/events', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select eventID, eventname, CASE WHEN type = 1 THEN 'Seminar' WHEN type = 2 THEN 'Class' ELSE 'Workshop' END AS type, convert(varchar(20),date,111) as date from events", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/upcoming', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select eventID, eventname, CASE WHEN type = 1 THEN 'Seminar' WHEN type = 2 THEN 'Class' ELSE 'Workshop' END AS type, convert(varchar(20),date,111) as date from events where date >= GETDATE()", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/attendance', checkAuth, function(req, res) {
        var userID = req.session.user_id;
        request.query("Select events.eventname, CASE WHEN events.type = 1 THEN 'Seminar' WHEN events.type = 2 THEN 'Class' ELSE 'Workshop' END AS type, convert(varchar(20),events.date,111) as date, signups.present from signups INNER JOIN events on signups.eventID = events.eventID where userID = '" + userID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/attendance/:id', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select events.name, CASE WHEN events.type = 1 THEN 'Seminar' WHEN events.type = 2 THEN 'Class' ELSE 'Workshop' END AS type, convert(varchar(20),events.date,111) as date, signups.present from signups INNER JOIN events on signups.eventID = events.eventID where userID = '" + userID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/eventattendance/:id', checkAuth, function(req, res) {
        var eventID = validator.toInt(req.params.id);
        request.query("Select * from signups where eventID = '" + eventID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/leader/:id', checkAuth, function(req, res) {
        var groupID = validator.toInt(req.params.id);
        request.query("Select userID from leaders where groupID = '" + groupID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else if (recordset[0]) {
                res.send(recordset[0]);
            } else {
                res.send(404, 'No leader of that groupID.');
            }
        });
    });
    app.get('/isleader/:id', checkAuth, function(req, res) {
        var userID = validator.toInt(req.params.id);
        request.query("Select groupID from leaders where userID = '" + userID + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
    app.get('/isleader', checkAuth, function(req, res) {
        request.query("Select groupID from leaders where userID = '" + req.session.user_id + "'", function(err, recordset) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(recordset);
            }
        });
    });
/* ------------------------------ Post Requests ----------------------------- */
    app.post('/register', function(req, res) {
        var body = req.body,
            fname = validator.toString(body.firstname),
            lname = validator.toString(body.lastname),
            address = validator.toString(body.address),
            city = validator.toString(body.city),
            state = validator.toString(body.state),
            marital = validator.toString(body.marital),
            gender = validator.toString(body.gender)
            birthdate = validator.toString(body.birthdate),
            email = validator.toString(body.email),
            password = validator.toString(body.password);
        if (gender == "male") {
            gender = 0;
        } else if (gender == "female") {
            gender = 1;
        }
        if (marital == "single") {
            marital = 1;
        } else if (marital == "married") {
            marital = 2;
        } else if (marital == "widowed") {
            marital = 3;
        } else if (marital == "divorced") {
            marital = 4;
        }
        request.query("select * from users where email='" + email + "'", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                res.send(409, 'This email address has already been used.');
            } else {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        request.query("insert into users (fname,lname,address,city,state,email,password,marital,gender,birthdate,groupID) values ('" + fname + "','" + lname + "','" + address + "','" + city + "','" + state + "','" + email + "','" + hash + "'," + marital + "," + gender + ",'" + birthdate + "',1)", function(err, recordset) {
                            console.log("query error: " + err);
                            res.send(201, 'User account has been created.');
                        });
                    });
                });
            }
        });
    });
    app.post('/assignleader/:userID/:groupID', checkLeader, function(req, res) {
        var userID = validator.toInt(req.params.userID),
            groupID = validator.toInt(req.params.groupID);
        request.query("insert into leaders values ('" + userID + "','" + groupID + "')", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send("Success");
            }
        });
    });
    app.post('/assignuser', checkLeader, function(req, res) {
        var body = req.body,
            userID = body.memberID,
            groupID = body.groupID;
        request.query("update users set groupID = " + groupID + " where userID=" + userID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send("Success");
            }
        });
    });
    app.post('/attendance/:userID/:eventID', checkLeader, function(req, res) {
        var userID = validator.toInt(req.params.userID),
            eventID = validator.toInt(req.params.eventID);
        request.query("update signups SET present = CASE WHEN present = 1 THEN 0 ELSE 1 END where userid=" + userID + " and eventID=" + eventID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send("Success");
            }
        });
    });
    app.post('/event', checkLeader, function(req, res) {
        var body = req.body,
            eventname = body.eventname,
            eventdate = body.eventdate,
            type = body.eventtype;
        if (type == "seminar") {
            type = 1;
        } else if (type == "class") {
            type = 2;
        } else if (type == "workshop") {
            type = 3;
        }
        request.query("insert into events values ('" + eventname + "','" + type + "','" + eventdate + "')", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                res.send("Success");
            }
        });
    });
    app.post('/group', checkLeader, function(req, res) {
        var body = req.body,
            groupname = body.groupname,
            userID = body.userID;
        request.query("insert into groups values ('" + groupname + "')", function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else {
                request.query("select groupID from groups where groupname='" + groupname + "'", function(err, recordset) {
                    if (err) {
                        res.send(400, err);
                    } else if (recordset[0]) {
                        var groupID = recordset[0].groupID
                        request.query("insert into leaders values (" + userID + "," + groupID + ")", function(err, recordset) {
                            if (err) {
                                res.send(400, err);
                            } else {
                                request.query("update users set groupID=" + groupID + " where userID=" + userID, function(err, recordset) {
                                    if (err) {
                                        res.send(400, err);
                                    } else {
                                        res.end('Success');
                                    }
                                });
                            }
                        });
                    } else {
                        res.send(404, 'Group was not created.');
                    }
                });
            }
        });
    });
    app.post('/signup', checkAuth, function(req, res) {
        var body = req.body,
            userID = req.session.user_id,
            eventID = body.eventID;
        request.query("select * from signups where userid=" + userID + " and eventID=" + eventID, function(err, recordset) {
            if (err) {
                res.send(400, err);
            } else if (recordset[0]) {
                res.send(409, "You have already signup for this event.");
            } else {
                request.query("insert into signups values (" + userID + "," + eventID + ",0)", function(err, recordset) {
                    if (err) {
                        res.send(400, err);
                    } else {
                        res.send('Success');
                    }
                });
            }
        });
    });

    // port initialization
    var port = Number(process.env.PORT || 5000);
    app.listen(port, function() {
        console.log("Listening on " + port);
    });
});