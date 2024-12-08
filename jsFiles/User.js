const express = require("express")
const http = require('http');
const Joi = require("joi");
const app = express();
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');

const mysql = require('mysql2/promise'); // promise 기반 mysql2 사용
const fs = require('fs');
const e = require("express");

const dbConfig1 = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'app_user',      // MySQL 사용자 이름
    password: 'User1234', // MySQL 비밀번호
    database: 'userInfo'   // 사용할 데이터베이스 이름
};

const dbConfigm = {
    host: '3.38.63.26', // MySQL 서버 호스트
    user: 'william00kim',      // MySQL 사용자 이름
    password: 'william00kim', // MySQL 비밀번호
    database: 'userInfo'   // 사용할 데이터베이스 이름
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 회원 정보 Joi 스키마 정의
const userSchema = Joi.object({
    USER_ID: Joi.string().email().required(),
    PASSWORD: Joi.string().min(8).required(),
    USERNAME: Joi.string().alphanum().min(3).max(5).required(),
    USERBIRTH: Joi.string().required(),
    HANDICAP: Joi.boolean().required()
});

// app.post('/addUser', async (req, res) => {
//     const {USER_ID, PASSWORD, USERNAME, USERBIRTH ,HANDICAP } = req.body;

//     console.error(req.body);
//     try {
//         const query = 'INSERT INTO user (USER_ID, PASSWORD, USERNAME, USERBIRTH ,HANDICAP) VALUES (?, ?, ?, ?, ?)';
//         const db = await mysql.createConnection(dbConfig1)
//         await hashPassword(PASSWORD).then((res) => {
//             db.query(query, [USER_ID, res, USERNAME, USERBIRTH ,HANDICAP] , (err, results) => {
//                 console.error(results.body);
//                 if (err) {
//                     console.error('Error inserting data:', err);
//                     return res.status(500).send('Database error');
//                 }
//                 res.json({
//                     "result" : "0"
//                 })

//                 db.end(); // 연결 종료
//             })
            

//         })
        
//     } catch(err) {
//         console.log(req.query);
//         res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
//         return;
//     }
    
// })

app.post('/addUser', async (req, res) => {
    const { USER_ID, PASSWORD, USERNAME, USERBIRTH, HANDICAP } = req.body;

    console.error(req.body); // 요청 본문 출력

    try {
        // 비밀번호 해시화
        const hashedPassword = await hashPassword(PASSWORD);

        // 데이터베이스 연결 생성
        const db = await mysql.createConnection(dbConfig1);

        // SQL 쿼리 실행
        const query = 'INSERT INTO user (USER_ID, PASSWORD, USERNAME, USERBIRTH, HANDICAP) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [USER_ID, hashedPassword, USERNAME, USERBIRTH, HANDICAP], (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                db.end(); // 연결 종료
                return res.status(500).json({ result: 0 }); // 에러 시 응답
            }

            // 성공 시 응답
            console.log('Data inserted successfully:', results);
            

            db.end(); // 연결 종료
        });

        res.json({ result: 1 });
    } catch (err) {
        console.error('Database error:', err.stack);
        res.status(500).send(`데이터베이스 오류입니다: ${err.stack}`);
    }
});



//아이디 확인하기
app.get("/checkId/:id", async (req, res) => {

    const Userid = req.params;

    try {
        const conection = await mysql.createConnection(dbConfig1);
        const query = 
        `
            SELECT USER_ID, USERNAME, USERBIRTH, HANDICAP 
            FROM userInfo.user
            WHERE USER_ID = ?
        `;
        
        const rows = await conection.query(query, Userid.id);
        // res.json(rows);
        
        await conection.end();

        if(Userid.id === rows[0][0].USER_ID) {
            res.json({
                result : "이미 존재히는 계정입니다."
            })
        }

    } catch(err) {
        console.log(req.query);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
    
})

app.post("/checkId", async(req, res) => {
    const {USER_ID} = req.body;

    try {
        const conection = await mysql.createConnection(dbConfig1);
        const query = 
        `
            SELECT USER_ID 
            FROM userInfo.user
            WHERE USER_ID = ?
        `;
        
        const rows = await conection.query(query, [USER_ID]);
        
        await conection.end();

        if(USER_ID === rows[0][0].USER_ID) {
            res.json({
                result : 0
            })
        } else {
            res.json({
                result : 1
            })
        }

    } catch(err) {
        console.log(req.query);
        res.json({
            result : 1
        })
        return;
    }
})

//내정보 찾기
app.post("/findHandi", async(req, res) => {
    const {id} = req.body;

    console.error(req.body);

    try {
        const connection = await mysql.createConnection(dbConfigm);

        const query = `
            SELECT HANDICAP
            FROM userInfo.user
            WHERE USER_ID = ?;
        `;
        
        const row = await connection.query(query ,[id])

        console.log(row[0][0].HANDICAP)

        res.status(200).json({
            "Handicap" : row[0][0].HANDICAP
        })

    } catch(err) {
        console.log(err);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
})

app.post("/myInfo", async(req, res) => {
    const {USER_ID} = req.body;

    console.error(req.body);

    try {
        const connection = await mysql.createConnection(dbConfigm);

        const query = `
            SELECT USER_ID, USERNAME, USERBIRTH, HANDICAP
            FROM userInfo.user
            WHERE USER_ID = ?;
        `;
        
        const row = await connection.query(query ,[USER_ID])

        console.log(row[0][0].HANDICAP)

        res.status(200).json({
            "USER_ID" : row[0][0].USER_ID,
            "USERNAME" : row[0][0].USERNAME,
            "USERBIRTH" : row[0][0].USERBIRTH,
            "Handicap" : row[0][0].HANDICAP
        })

    } catch(err) {
        console.log(err);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
})

//로그인 하기
app.post("/login", async(req, res) => {
    const { USER_ID, PASSWORD } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig1);

        const query = 
        `
            SELECT USER_ID, PASSWORD
            FROM userInfo.user
            WHERE USER_ID = ?
        `;
        
        const rows = await connection.query(query, [USER_ID]);

        console.log(rows[0][0].USER_ID);
        console.log(rows[0][0].PASSWORD);
        
        const isMatch = await bcrypt.compare(PASSWORD, rows[0][0].PASSWORD);

        await connection.end();

        if(isMatch) {
            console.log("로그인 성공");
            res.status(200).json({
                "message" : "로그인 성공."
            })
        } else {
            console.log("로그인 실패");
            res.status(200).json({
                "message" : "로그인 실패."
            })
        }

    } catch(err) {
        console.log(err);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
})

app.post("/findId", (res, req) => {
    
})

app.post("/findPW", (res, req) => {

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
        
        const [rows] = await conection.query(query, [name]);
        
        console.log(rows)
        
        await conection.end();

    } catch(err) {
        console.log(req.query);
        res.status(500).send(`데이터베이스 오류입니다.  ${err.stack}`);
        return;
    }
})


//암호화 하는 코드
async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

app.listen(3030, () => {
    console.log("서버 실행");
})