const mysql = require('mysql2/promise'); // promise 기반 mysql2 사용
const fs = require('fs');

// MySQL 연결 설정
const dbConfig = {
  host: '3.38.63.26', // MySQL 서버 호스트
  user: 'william00kim',      // MySQL 사용자 이름
  password: 'william00kim', // MySQL 비밀번호
  database: 'non_handicap'   // 사용할 데이터베이스 이름
};

// JSON 데이터 읽기
const jsonFile = fs.readFileSync('../jsonData/KS_SVCH_UTILIIZA_CRSTAT_INFO_202410.json', 'utf8');
const jsonData = JSON.parse(jsonFile);

// 한 번에 처리할 데이터 개수 (배치 크기)
const BATCH_SIZE = 10000;

// SQL 삽입 함수
const insertDataBatch = async (connection, dataBatch) => {
  const sqlQuery = `
    INSERT INTO non_handicap.users (
      BSNS_NO, FCLTY_NM, ITEM_CD, ITEM_NM, CTPRVN_CD, CTPRVN_NM, SIGNGU_CD, SIGNGU_NM,
      FCLTY_ADDR, FCLTY_DETAIL_ADDR, ZIP_NO, TEL_NO, COURSE_NM, COURSE_NO, COURSE_ESTBL_YEAR,
      COURSE_ESTBL_MT, COURSE_BEGIN_DE, COURSE_END_DE, COURSE_REQST_NMPR_CO, COURSE_PRC
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const data of dataBatch) {
    const values = [
      data.BSNS_NO, data.FCLTY_NM, data.ITEM_CD, data.ITEM_NM, data.CTPRVN_CD, data.CTPRVN_NM,
      data.SIGNGU_CD, data.SIGNGU_NM, data.FCLTY_ADDR, data.FCLTY_DETAIL_ADDR, data.ZIP_NO,
      data.TEL_NO, data.COURSE_NM, data.COURSE_NO, data.COURSE_ESTBL_YEAR, data.COURSE_ESTBL_MT,
      data.COURSE_BEGIN_DE, data.COURSE_END_DE, data.COURSE_REQST_NMPR_CO, data.COURSE_PRC
    ];

    try {
      await connection.execute(sqlQuery, values); // 비동기로 실행
      console.log('Data inserted successfully:', values[0]); // 예시: BSNS_NO 출력
    } catch (err) {
      console.error('Error inserting data:', err.message);
    }
  }
};

// 전체 데이터 처리
const processData = async () => {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log(`Total records to process: ${jsonData.length}`);
    
    // 배치 단위로 데이터 처리
    for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
      const dataBatch = jsonData.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch: ${i + 1} to ${i + dataBatch.length}`);
      await insertDataBatch(connection, dataBatch);
    }

    console.log('All data processed successfully.');
  } catch (err) {
    console.error('Error processing data:', err.message);
  } finally {
    await connection.end(); // 연결 닫기
    console.log('Database connection closed.');
  }
};

// 실행
processData();