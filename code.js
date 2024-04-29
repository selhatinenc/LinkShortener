const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123123123',
    database: 'shorturls'
});

con.connect((err) => {
    if (err) {
        console.error('MySQL bağlantı hatası:', err);
        return;
    }
    console.log('MySQL bağlantısı başarılı!');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post("/api/create-short-url", function (req, response) {
    let uniqueId = Math.random().toString(36).substring(7);
    let sql = `INSERT INTO links (longurl, shorturlid) VALUES ('${req.body.longurl}', '${uniqueId}')`;
    con.query(sql, function (err, result) {
        if (err) {
            response.status(500).json({ status: 'notok', message: "Something went wrong" });
        } else {
            response.status(200).json({ status: 'success', message: "Short URL created successfully", shorturlid: uniqueId });
        }
    });
});

app.get("/api/get-all-short-urls", function (req, response) {
    let sql = `SELECT * FROM links`;
    con.query(sql, function (err, result) {
        if (err) {
            response.status(500).json({ status: 'notok', data:sql });
        } else {
            response.status(200).json(result);
        }
    });
});

app.get("/:shorturlid", function (req, response) {
    let shorturlid = req.params.shorturlid;
    let sql = `SELECT * FROM links WHERE shorturlid = '${shorturlid}' LIMIT 1`;
    con.query(sql, function (err, result) {
        if (err) {
            response.status(500).json({ status: 'notok', message: "Something went wrong" });
        } else {
            if (result.length === 0) {
                response.status(404).json({ status: 'notok', message: "Short URL not found" });
            } else {
                sql = `UPDATE links SET count = ${result[0].count + 1} WHERE id = '${result[0].id}' LIMIT 1`;
                con.query(sql, function (err, result2) {
                    if (err) {
                        response.status(500).json({ status: 'notok', message: "Something went wrong" });
                    } else {
                        response.redirect(result[0].longurl);
                    }
                });
            }
        }
    });
});

app.listen(5000);
