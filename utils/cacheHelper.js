const redis = require('redis');

// Redis 클라이언트 생성 (로컬 개발용)
const client = redis.createClient({
  host: process.env.REDIS_URL || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.log('Redis 서버에 연결할 수 없습니다. 캐시를 사용하지 않습니다.');
      return undefined;
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis 재시도 시간 초과');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis 연결
client.on('error', (err) => {
  console.log('Redis Client Error:', err);
});

// 캐시 헬퍼 함수들
const cacheHelper = {
  // 캐시에서 데이터 가져오기
  async get(key) {
    try {
      if (!client.isOpen) {
        await client.connect();
      }
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('캐시 조회 실패:', error.message);
      return null;
    }
  },

  // 캐시에 데이터 저장하기
  async set(key, data, ttl = 300) { // 기본 5분 TTL
    try {
      if (!client.isOpen) {
        await client.connect();
      }
      await client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.log('캐시 저장 실패:', error.message);
      return false;
    }
  },

  // 캐시 삭제
  async del(key) {
    try {
      if (!client.isOpen) {
        await client.connect();
      }
      await client.del(key);
      return true;
    } catch (error) {
      console.log('캐시 삭제 실패:', error.message);
      return false;
    }
  },

  // 사용자별 캐시 키 생성
  getUserCacheKey(userId, type, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? '_' + Object.entries(params).map(([k, v]) => `${k}_${v}`).join('_')
      : '';
    return `user_${userId}_${type}${paramString}`;
  }
};

module.exports = cacheHelper;
