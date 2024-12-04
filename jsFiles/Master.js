const express = require("express")
const http = require('http');
const app = express();
var bodyParser = require('body-parser');

const mysql = require('mysql2/promise'); // promise 기반 mysql2 사용
const fs = require('fs');

const dbConfig = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'UserInfo',      // MySQL 사용자 이름
    password: '0000', // MySQL 비밀번호
    database: 'non_handicap'   // 사용할 데이터베이스 이름
};


app.get("/:name", async (req, res) => {
    try {
        const {name} = req.params;
        const conection = await mysql.createConnection(dbConfig);
        const query = 
        `
            SELECT *
            FROM non_handicap.users
            WHERE FCLTY_NM = ?
        `;
        
        const [rows] = await conection.query(query, name);
        res.json(rows);
        
        await conection.end();
        console.log(rows);

    } catch(err) {
        console.log(req.query);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
})

app.get("")

app.listen(3030, () => {
    console.log("서버 실행");
})