const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    console.log('MongoDB 연결 시도 중...');
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      socketTimeoutMS: 45000, // 45초 소켓 타임아웃
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔧 연결 실패 원인:');
    console.error('   - MongoDB URI가 올바른지 확인');
    console.error('   - 네트워크 연결 상태 확인');
    console.error('   - MongoDB Atlas IP 화이트리스트 확인');
    process.exit(1);
  }
};

module.exports = connectDB;

