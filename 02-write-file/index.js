const { stdin, stdout, exit } = process;
const fs = require('fs');
const path = require('path');
const writeStream = fs.createWriteStream(
  path.join(__dirname, 'text.txt'),
  'utf-8',
);
stdout.write('write some text\n');
stdin.on('data', chunk => {
  if (chunk.toString().trim() !== 'exit') {
    writeStream.write(chunk);
  } else {
    exit();
  }
});
process.on('exit', () => stdout.write('bye!'));
process.on('SIGINT', exit);
