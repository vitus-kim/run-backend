const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

// 환경 변수 검증
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ 필수 환경 변수가 설정되지 않았습니다:', missingEnvVars.join(', '));
  console.error('🔧 .env 파일을 확인하고 필요한 환경 변수를 설정하세요.');
  process.exit(1);
}

// JWT 시크릿 키 보안 검증
if (process.env.JWT_SECRET === 'your_jwt_secret_key_here' || 
    process.env.JWT_REFRESH_SECRET === 'your_jwt_refresh_secret_key_here') {
  console.error('❌ 보안 위험: 기본 JWT 시크릿 키를 사용하고 있습니다!');
  console.error('🔧 .env 파일에서 JWT_SECRET과 JWT_REFRESH_SECRET을 강력한 랜덤 문자열로 변경하세요.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 localhost 허용
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176',
      // 프로덕션 환경에서는 실제 도메인 추가
      'https://run-client-tau.vercel.app',
      'https://run-backend-sand.vercel.app',
      'https://run-client-kabvmzblj-virtuosokgh-2145s-projects.vercel.app',
      'https://run-backend-3xxm0fyv6-virtuosokgh-2145s-projects.vercel.app',
      // Vercel Preview URLs 패턴 추가
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*-.*-.*\.vercel\.app$/,
      process.env.CLIENT_URL || 'https://your-frontend-domain.com'
    ];
    
    // origin이 없는 경우 (모바일 앱 등) 허용
    if (!origin) return callback(null, true);
    
    // 문자열 매칭
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 정규식 패턴 매칭 (Vercel URLs)
      const isAllowed = allowedOrigins.some(pattern => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS 차단된 Origin:', origin);
        callback(new Error('CORS 정책에 의해 차단되었습니다'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API routes
app.use('/api', require('./routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ 서버 에러 발생:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // CORS 에러 처리
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      message: 'CORS 정책에 의해 요청이 차단되었습니다',
      error: 'CORS_ERROR'
    });
  }
  
  // 프로덕션 환경에서는 상세 에러 정보 숨김
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(500).json({ 
    message: '서버 내부 오류가 발생했습니다',
    ...(isDevelopment && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown 처리
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
  process.exit(0);
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (err) => {
  console.error('❌ 처리되지 않은 예외:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? '연결됨' : '로컬'}`);
});
