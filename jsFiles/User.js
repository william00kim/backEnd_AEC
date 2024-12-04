const express = require("express")
const http = require('http');
const Joi = require("joi");
const app = express();
var bodyParser = require('body-parser');

const mysql = require('mysql2/promise'); // promise 기반 mysql2 사용
const fs = require('fs');

const dbConfig1 = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'app_user',      // MySQL 사용자 이름
    password: 'User1234', // MySQL 비밀번호
    database: 'userinfo'   // 사용할 데이터베이스 이름
};

const dbConfig2 = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'app_user',      // MySQL 사용자 이름
    password: 'User1234', // MySQL 비밀번호
    database: 'non_handicap'   // 사용할 데이터베이스 이름
};

const dbConfig3 = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'app_user',      // MySQL 사용자 이름
    password: 'User1234', // MySQL 비밀번호
    database: 'handicap'   // 사용할 데이터베이스 이름
};


// 회원 정보 Joi 스키마 정의
const userSchema = Joi.object({
    USER_ID: Joi.string().email().required(),
    PASSWORD: Joi.string().min(8).required(),
    USERNAME: Joi.string().alphanum().min(3).max(5).required(),
    USERBIRTH: Joi.string().required(),
    HANDICAP: Joi.boolean().required(),
  });
  
  // 회원가입 API (회원정보 등록)
  app.post("/createUser/register", async (req, res) => {
    try {
      // 요청 데이터 유효성 검사
      const { error, value } = userSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      const { USER_ID, PASSWORD, USERNAME, HANDICAP } = value;
  
      // 데이터 삽입 SQL
      const query = `INSERT INTO users (USER_ID, PASSWORD, USERNAME, USERBIRTH, HANDICAP) VALUES (?, ?, ?, ?, ?)`;
  
      // 데이터베이스 연결 및 실행
      const connection = await mysql.createConnection(dbConfigs.userInfo);
      const [result] = await connection.query(query, [USER_ID, PASSWORD, USERNAME, USERBIRTH, HANDICAP]);
  
      await connection.end();
  
      res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post('addUser', (req, res) => {
    const {USER_ID, PASSWORD, USERNAME, USERBIRTH ,HANDICAP } = req.body;

    const query = 'INSERT INTO users (USER_ID, PASSWORD, USERNAME, USERBIRTH ,HANDICAP) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).send('Data inserted successfully!');
    });

  })
  
//원하는 운동 장소 찾기 비장애인 데이터
app.get("/nonhandi/:name", async (req, res) => {
    try {
        const {name} = req.params;
        const conection = await mysql.createConnection(dbConfig2);
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

//장애인 데이터
app.get("/handi/:name", async (req, res) => {
    try {
        const {name} = req.params;
        const conection = await mysql.createConnection(dbConfig3);
        const query = 
        `
            SELECT *
            FROM handicap.users
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

app.listen(8000, () => {
    console.log("서버 실행");
})