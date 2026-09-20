require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Task Manager API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Task endpoints:`);
  console.log(`   GET/POST http://localhost:${PORT}/api/tasks`);
  console.log(`   GET/PUT/DELETE http://localhost:${PORT}/api/tasks/:id\n`);
});
