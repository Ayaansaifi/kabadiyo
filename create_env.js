const fs = require('fs');
const content = `DATABASE_URL="file:./dev.db"
AUTH_SECRET="secret"`;
fs.writeFileSync('.env', content);
console.log('.env created');
