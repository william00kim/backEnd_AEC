// const express = require("express");
// const mysql = require("mysql2/promise");
// const axios = require("axios");
// const haversine = require("haversine");

// const app = express();
// const PORT = 3050;

// // JSON 형태로 요청 데이터를 파싱하기 위해 express.json() 미들웨어 추가
// app.use(express.json()); 

// // MySQL 연결 설정
// const dbConfig = {
//   host: "3.38.63.26",
//   user: "william00kim",
//   password: "william00kim",
//   database: "non_handicap",
// };

// // 카카오맵 API 키
// // const KAKAO_API_KEY = "c125005aa4792a91b4390275ec6ed8c5";

// // // 위도, 경도를 `handicap.facilities`에 저장하는 함수
// // async function syncUserCoordinatesToFacilities() {
// //   const connection = await mysql.createConnection(dbConfig);

// //   try {
// //     // users 테이블에서 FCLTY_ADDR 가져오기
// //     const [users] = await connection.execute(
// //       "SELECT BSNS_NO, FCLTY_NM,FCLTY_ADDR FROM handicap.users WHERE FCLTY_ADDR IS NOT NULL"
// //     );

// //     for (const user of users) {
// //       const { BSNS_NO, FCLTY_NM, FCLTY_ADDR } = user;
  
// //       // 카카오맵 API로 FCLTY_ADDR를 위도 경도로 변환
// //       const response = await axios.get("https://dapi.kakao.com/v2/local/search/address.json", {
// //         headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
// //         params: { query: FCLTY_ADDR },
// //       });

// //       if (response.data.documents.length > 0) {
// //         const { x, y } = response.data.documents[0]; // x: 경도, y: 위도

// //         // facilities 테이블에 값 저장
// //         await connection.execute(
// //           "INSERT INTO non_hadnicap.facilities (BSNS_NO ,FCLTY_NM, FCLTY_ADDR, LATITUDE, LONGITUDE) VALUES (?, ?, ?, ?, ?) ",
// //           // "INSERT INTO handicap.facilities (BSNS_NO ,FCLTY_NM, FCLTY_ADDR, LATITUDE, LONGITUDE) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE LATITUDE = ?, LONGITUDE = ?",
// //           [BSNS_NO, FCLTY_NM, FCLTY_ADDR, y, x]
// //         );

// //         console.log(`Inserted/Updated: ${FCLTY_ADDR} -> lat=${y}, lon=${x}`);
// //       } else {
// //         console.error(`Address not found: ${FCLTY_ADDR}`);
// //       }
// //     }
// //   } catch (error) {
// //     console.error("Error syncing coordinates to facilities:", error.message);
// //   } finally {
// //     await connection.end();
// //   }
// // }

// // // 반경 10km 내 시설 검색
// // async function getNearbyFacilities(userLat, userLon) {
// //   const connection = await mysql.createConnection(dbConfig);

// //   try {
// //     // facilities 테이블에서 운동시설 목록 가져오기
// //     const [rows] = await connection.execute(
// //       "SELECT FCLTY_NM, LATITUDE, LONGITUDE FROM handicap.facilities WHERE LATITUDE IS NOT NULL AND LONGITUDE IS NOT NULL"
// //     );

// //     const nearbyFacilities = rows.filter((facility) => {
// //       const distance = haversine(
// //         { latitude: userLat, longitude: userLon },
// //         { latitude: facility.LATITUDE, longitude: facility.LONGITUDE },
// //         { unit: "km" }
// //       );

// //       return distance <= 10; // 반경 10km 이내 필터링
// //     });

// //     return nearbyFacilities.map(facility => ({ name: facility.FCLTY_NM }));
// //   } catch (error) {
// //     console.error("Error during database query or haversine calculation:", error.message);
// //     throw error;
// //   } finally {
// //     await connection.end();
// //   }
// // }

// // // API 엔드포인트: 사용자로부터 lat/lon을 입력받아 반경 내 운동시설 출력
// // app.post("/nearby-facilities", async (req, res) => {
// //   const { lat, lon } = req.body; // JSON 형태로 전달받은 사용자 위치
// //   console.log("Received lat and lon:", lat, lon);

// //   if (!lat || !lon) {
// //     return res.status(400).json({ error: "lat and lon are required" });
// //   }

// //   try {
// //     const facilities = await getNearbyFacilities(parseFloat(lat), parseFloat(lon));
// //     res.status(200).json(facilities);
// //   } catch (error) {
// //     res.status(500).json({ error: "Failed to fetch nearby facilities" });
// //   }
// // });

// // // 서버 실행
// // app.listen(PORT, async () => {
// //   console.log(`Server running on http://localhost:${PORT}`);
  
// //   console.log("Syncing coordinates from users to facilities...");
// //   await syncUserCoordinatesToFacilities();
// // });


// // 카카오맵 API 키 배열
// const KAKAO_API_KEYS = ["ae2c75c7f2fe4e6fe58246389660e816", "c125005aa4792a91b4390275ec6ed8c5", "fd9f32d9a622870e051a65b0f9c9433f"]; // 여러 앱 키를 배열로 저장
// let currentKeyIndex = 0; // 현재 사용하는 앱 키의 인덱스

// // 현재 사용 중인 API 키 반환 함수
// function getCurrentKakaoKey() {
//   return KAKAO_API_KEYS[currentKeyIndex];
// }

// // 다음 API 키로 전환하는 함수
// function switchKakaoKey() {
//   currentKeyIndex = (currentKeyIndex + 1) % KAKAO_API_KEYS.length;
//   console.log(`Switched to Kakao API Key: ${getCurrentKakaoKey()}`);
// }

// // 위도, 경도를 `handicap.facilities`에 저장하는 함수
// async function syncUserCoordinatesToFacilities() {
//   const connection = await mysql.createConnection(dbConfig);

//   try {
//     // users 테이블에서 FCLTY_ADDR 가져오기
//     const [users] = await connection.execute(
//       "SELECT BSNS_NO, FCLTY_NM, FCLTY_ADDR FROM non_handicap.users WHERE FCLTY_ADDR IS NOT NULL"
//     );

//     for (const user of users) {
//       const { BSNS_NO, FCLTY_NM, FCLTY_ADDR } = user;

//       try {
//         // 카카오맵 API로 FCLTY_ADDR를 위도 경도로 변환
//         const response = await axios.get("https://dapi.kakao.com/v2/local/search/address.json", {
//           headers: { Authorization: `KakaoAK ${getCurrentKakaoKey()}` },
//           params: { query: FCLTY_ADDR },
//         });

//         if (response.data.documents.length > 0) {
//           const { x, y } = response.data.documents[0]; // x: 경도, y: 위도

//           // facilities 테이블에 값 저장
//           await connection.execute(
//             "INSERT INTO non_handicap.facilities (BSNS_NO, FCLTY_NM, FCLTY_ADDR, LATITUDE, LONGITUDE) VALUES (?, ?, ?, ?, ?)",
//             [BSNS_NO, FCLTY_NM, FCLTY_ADDR, y, x]
//           );

//           console.log(`Inserted/Updated: ${FCLTY_ADDR} -> lat=${y}, lon=${x}`);
//         } else {
//           console.error(`Address not found: ${FCLTY_ADDR}`);
//         }
//       } catch (error) {
//         if (error.response && error.response.status === 429) { // API 호출 제한 초과 (status 429)
//           console.warn(`API limit reached for key: ${getCurrentKakaoKey()}`);
//           switchKakaoKey(); // 키 전환
//         } else {
//           console.error(`Error processing address: ${FCLTY_ADDR}`, error.message);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error syncing coordinates to facilities:", error.message);
//   } finally {
//     await connection.end();
//   }
// }


const express = require("express");
const mysql = require("mysql2/promise");
const axios = require("axios");
const haversine = require("haversine");
const pLimit = require("p-limit"); // 병렬 요청 제한을 위한 라이브러리

const app = express();
const PORT = 3050;

// JSON 형태로 요청 데이터를 파싱하기 위해 express.json() 미들웨어 추가
app.use(express.json());

// MySQL 연결 설정
const dbConfig = {
  host: "3.38.63.26",
  user: "william00kim",
  password: "william00kim",
  database: "non_handicap",
};

// 카카오맵 API 키 배열
const KAKAO_API_KEYS = ["ae2c75c7f2fe4e6fe58246389660e816", "c125005aa4792a91b4390275ec6ed8c5", "fd9f32d9a622870e051a65b0f9c9433f"]; // 여러 앱 키를 배열로 저장
let currentKeyIndex = 0; // 현재 사용하는 앱 키의 인덱스

// 병렬 처리 제한
const MAX_CONCURRENT_REQUESTS = 10; // 동시에 처리할 최대 요청 개수
const limit = pLimit(MAX_CONCURRENT_REQUESTS); // 제한 생성

// 현재 사용 중인 API 키 반환 함수
function getCurrentKakaoKey() {
  return KAKAO_API_KEYS[currentKeyIndex];
}

// 다음 API 키로 전환하는 함수
function switchKakaoKey() {
  currentKeyIndex = (currentKeyIndex + 1) % KAKAO_API_KEYS.length;
  console.log(`Switched to Kakao API Key: ${getCurrentKakaoKey()}`);
}

// 위도, 경도를 `non_handicap.facilities`에 저장하는 함수
async function syncUserCoordinatesToFacilities() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // users 테이블에서 FCLTY_ADDR 가져오기
    const [users] = await connection.execute(
      "SELECT BSNS_NO, FCLTY_NM, FCLTY_ADDR FROM non_handicap.users WHERE FCLTY_ADDR IS NOT NULL"
    );

    const tasks = users.map((user) =>
      limit(async () => {
        const { BSNS_NO, FCLTY_NM, FCLTY_ADDR } = user;

        try {
          // 카카오맵 API로 FCLTY_ADDR를 위도 경도로 변환
          const response = await axios.get("https://dapi.kakao.com/v2/local/search/address.json", {
            headers: { Authorization: `KakaoAK ${getCurrentKakaoKey()}` },
            params: { query: FCLTY_ADDR },
          });

          if (response.data.documents.length > 0) {
            const { x, y } = response.data.documents[0]; // x: 경도, y: 위도

            // facilities 테이블에 값 저장
            await connection.execute(
              "INSERT INTO non_handicap.facilities (BSNS_NO, FCLTY_NM, FCLTY_ADDR, LATITUDE, LONGITUDE) VALUES (?, ?, ?, ?, ?)",
              [BSNS_NO, FCLTY_NM, FCLTY_ADDR, y, x]
            );

            console.log(`Inserted/Updated: ${FCLTY_ADDR} -> lat=${y}, lon=${x}`);
          } else {
            console.error(`Address not found: ${FCLTY_ADDR}`);
          }
        } catch (error) {
          if (error.response && error.response.status === 429) {
            console.warn(`API limit reached for key: ${getCurrentKakaoKey()}`);
            switchKakaoKey(); // 키 전환
          } else {
            console.error(`Error processing address: ${FCLTY_ADDR}`, error.message);
          }
        }
      })
    );

    // 모든 요청 병렬 실행
    await Promise.all(tasks);
    console.log("All coordinates synced successfully.");
  } catch (error) {
    console.error("Error syncing coordinates to facilities:", error.message);
  } finally {
    await connection.end();
  }
}

// 반경 10km 내 시설 검색
async function getNearbyFacilities(userLat, userLon) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // facilities 테이블에서 운동시설 목록 가져오기
    const [rows] = await connection.execute(
      "SELECT FCLTY_NM, LATITUDE, LONGITUDE FROM non_handicap.facilities WHERE LATITUDE IS NOT NULL AND LONGITUDE IS NOT NULL"
    );

    const nearbyFacilities = rows.filter((facility) => {
      const distance = haversine(
        { latitude: userLat, longitude: userLon },
        { latitude: facility.LATITUDE, longitude: facility.LONGITUDE },
        { unit: "km" }
      );

      return distance <= 10; // 반경 10km 이내 필터링
    });

    return nearbyFacilities.map(facility => ({ name: facility.FCLTY_NM }));
  } catch (error) {
    console.error("Error during database query or haversine calculation:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// API 엔드포인트: 사용자로부터 lat/lon을 입력받아 반경 내 운동시설 출력
app.post("/nearby-facilities", async (req, res) => {
  const { lat, lon } = req.body; // JSON 형태로 전달받은 사용자 위치
  console.log("Received lat and lon:", lat, lon);

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    const facilities = await getNearbyFacilities(parseFloat(lat), parseFloat(lon));
    res.status(200).json(facilities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby facilities" });
  }
});

// 서버 실행
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  console.log("Syncing coordinates from users to facilities...");
  await syncUserCoordinatesToFacilities();
});
