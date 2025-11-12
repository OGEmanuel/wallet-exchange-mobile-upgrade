const fs = require('fs'), p = require('path');
const pkgPath = require.resolve('@zap/blockchain-sdk/package.json');
const dir = p.dirname(pkgPath);
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log('[ZAP SDK] package.json react-native:', pkg['react-native']);
console.log('[ZAP SDK] exports:', JSON.stringify(pkg.exports, null, 2));
console.log('[ZAP SDK] dist files:', fs.readdirSync(p.join(dir, 'dist')));
console.log('[ZAP SDK] react-native.js exists?', fs.existsSync(p.join(dir, 'dist/react-native.js')));
