const qr = require('qrcode-terminal');

// Get URL from command line argument
const url = process.argv[2];

if (!url) {
  console.log('Usage: node show-qr.js <URL>');
  process.exit(1);
}

console.log('\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('           📱 QR CODE - SCAN WITH YOUR PHONE');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');

// Generate QR code with better settings
qr.generate(url, {
  small: false,
  errorCorrectionLevel: 'M'
}, function (qrcode) {
  console.log(qrcode);
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('URL:', url);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n');
});



