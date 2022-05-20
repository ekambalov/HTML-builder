
const { readdir, stat } = require('fs/promises');
const path = require('path');
const { stdout } = process;

const folderPath = path.join(__dirname, 'secret-folder');

(async (dirPath) => {
  const files = await readdir(dirPath, { withFileTypes: true });
  for(const file of files){
    if(file.isFile()){

      const stats = await stat(path.join(dirPath, file.name));
      const fileParse = path.parse(path.join(dirPath, file.name));
      stdout.write(`${fileParse.name} - ${fileParse.ext.slice(1)} - ${stats.size/1024}kb\n`);
    }
  }
})(folderPath);