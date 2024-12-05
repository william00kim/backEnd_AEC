const express = require("express");
const axios = require("axios");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3050;

// Middleware to parse JSON requests
app.use(express.json());

// 카카오 REST API 키
const KAKAO_REST_API_KEY = "ae2c75c7f2fe4e6fe58246389660e816";

// MySQL 데이터베이스 설정
const dbConfig = {
    host: "3.38.63.26", // 데이터베이스 주소
    user: "app_user", // 사용자명
    password: "User1234", // 비밀번호
    database: "userinfo", // 데이터베이스 이름
};

// Haversine 거리 계산 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위 거리 반환
}

// 주변 운동 시설 검색 API (카카오맵 + 거리 계산)
app.get("/findNearbyFacilities/:lat/:lng", async (req, res) => {
    const { lat, lng } = req.params; // 클라이언트에서 받은 위도와 경도
    const keyword = "운동시설"; // 검색 키워드

    // 카카오 API 요청 URL
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        keyword
    )}&x=${lng}&y=${lat}&size=15`; // 위도와 경도를 포함한 API 요청 URL

    try {
        // 1. 카카오 API에 요청하여 운동시설 검색
        const response = await axios.get(url, {
            headers: {
                Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`, // 카카오 API 키 인증
            },
        });

        // 운동시설 정보
        const facilities = response.data.documents;

        // 2. 거리 계산 추가
        const facilitiesWithDistance = facilities.map((facility) => {
            const distance = calculateDistance(
                parseFloat(lat), // 클라이언트에서 받은 위도
                parseFloat(lng), // 클라이언트에서 받은 경도
                parseFloat(facility.y), // 운동시설 위도
                parseFloat(facility.x)  // 운동시설 경도
            );
            return {
                ...facility,
                distance: Math.round(distance), // 거리 (미터 단위) 추가
            };
        });

        // 3. 반경 3킬로미터 이내의 시설만 필터링
        const nearbyFacilities = facilitiesWithDistance.filter(facility => facility.distance <= 3000);

        // 4. 거리 순으로 정렬
        nearbyFacilities.sort((a, b) => a.distance - b.distance);

        // 5. 결과 반환
        res.json(nearbyFacilities); // 필터링된 시설을 클라이언트에 반환
    } catch (error) {
        console.error("Error fetching data from Kakao API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching data from Kakao API", details: error.response ? error.response.data : error.message });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
