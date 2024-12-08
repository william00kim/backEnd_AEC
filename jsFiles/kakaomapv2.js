require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3050;

// JSON 형태로 요청 데이터를 파싱하기 위해 express.json() 미들웨어 추가
app.use(express.json());

// CORS 활성화
app.use(cors());

// MySQL 연결 설정
const dbConfigs = {
    handicap: {
      host: "3.38.63.26",
      user: "william00kim",
      password: "william00kim",
      database: "handicap",
    },
    non_handicap: {
      host: "3.38.63.26",
      user: "william00kim",
      password: "william00kim",
      database: "non_handicap",
    },
  };

// 반경 3km 내 시설 검색 (SQL에서 필터링)
async function getNearbyFacilitiesWithDetails(userLat, userLon, isHandicap) {
  const dbConfig = isHandicap ? dbConfigs.handicap : dbConfigs.non_handicap;
  const connection = await mysql.createConnection(dbConfig);

  try {
    const query = `
      SELECT 
        f.FCLTY_NM, f.LATITUDE, f.LONGITUDE, 
        u.COURSE_PRC, u.ITEM_NM, u.TEL_NO, u.COURSE_NM, 
        u.COURSE_BEGIN_DE, u.COURSE_END_DE, u.COURSE_REQST_NMPR_CO, u.FCLTY_DETAIL_ADDR, u.FCLTY_ADDR
      FROM ${isHandicap ? "handicap" : "non_handicap"}.facilities f
      JOIN ${isHandicap ? "handicap" : "non_handicap"}.users u ON f.BSNS_NO = u.BSNS_NO
      WHERE f.LATITUDE IS NOT NULL AND f.LONGITUDE IS NOT NULL
        AND (
          6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(f.LATITUDE)) * COS(RADIANS(f.LONGITUDE) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(f.LATITUDE))
          )
        ) <= 3;`;

    // SQL 쿼리에 사용자 위치 삽입
    const [rows] = await connection.execute(query, [userLat, userLon, userLat]);

    const uniqueFacilities = rows.reduce((acc, facility) => {
      const key = `${facility.FCLTY_NM}-${facility.LATITUDE}-${facility.LONGITUDE}`;
      if (!acc[key]) {
        acc[key] = facility;
      }
      return acc;
    }, {});

    return Object.values(uniqueFacilities);
  } catch (error) {
    console.error("Error fetching facilities and user details:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// API 엔드포인트: 사용자로부터 lat/lon과 handicap 플래그를 받아 시설 정보 출력
app.post("/nearby-facilities", async (req, res) => {
  const { lat, lon, handicap } = req.body;

  if (!lat || !lon || typeof handicap === "undefined") {
    return res.status(400).json({ 
      status: "error",
      message: "lat, lon, and handicap flag are required"
    });
  }

  try {
    const facilities = await getNearbyFacilitiesWithDetails(
      parseFloat(lat),
      parseFloat(lon),
      Boolean(handicap)
    );

    res.status(200).json({
      status: "success",
      data: facilities,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch nearby facilities",
    });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
