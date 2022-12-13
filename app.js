    // Importing the framework
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
    // Importing sqlite and assigning the database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db.sqlite');

app.use(express.static('public'));
    // The line below is crucial for sending req.body to the client side
app.use(express.json({ limit: '1mb' }));
    // Allows to use information coming from forms
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(__dirname + 'public/CSS'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/images'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());

    // Renders the page
app.get('/', (req, res) => {
        res.render('schedule');
});

    // Sends all data from the database
app.get('/getting', (req, res) => {
    const sql2 = 'SELECT * FROM Visits';
    db.all(sql2, (err, rows) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        visitsDb = rows;
        res.json(visitsDb);
    });
});

app.post('/posting', (req, res, next) => {
        // Inserting into a database
    const sql = 'INSERT INTO Visits (name, surname, phone_number, SSN, day, time) VALUES ($name, $surname, $phone_number, $SSN, $day, $time)';
    db.run(sql, {
        $name: req.body[0],
        $surname: req.body[1],
        $phone_number: req.body[2],
        $SSN: req.body[3],
        $day: req.body[4],
        $time: req.body[5]
    }, function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(201);
        }
    });
});

app.put('/change', (req, res, next) => {
        // Updating a database
    const sql = 'UPDATE Visits SET name = $name, surname = $surname, phone_number = $phone_number, SSN = $SSN WHERE day = $day AND time = $time';
    db.run(sql, {
        $name: req.body[0],
        $surname: req.body[1],
        $phone_number: req.body[2],
        $SSN: req.body[3],
        $day: req.body[4],
        $time: req.body[5]
    }, function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(201);
        }
    });
});

app.delete('/day/:day/time/:time', (req, res) => {
        // Deleting data inside of the database
    const sql = 'DELETE FROM Visits WHERE day = $day AND time = $time';
    db.run(sql, {
        $day: req.params.day,
        $time: req.params.time
    }, function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(204);
        }
    });
});

const PORT = 4002;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});