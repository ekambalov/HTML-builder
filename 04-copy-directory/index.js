const { readdir, mkdir, copyFile } = require('fs/promises');
const path = require('path');
const { stdout } = process;

const folderPath = path.join(__dirname, 'files');
const folderPathCopy = path.join(__dirname, 'files-copy');

(async (dirPath, dirPathCopy) => {
  let filePath =[];
  let filePathCopy =[];
  const files = await readdir(dirPath, { withFileTypes: true });
  for(const file of files){
    if(file.isFile()){
      filePath.push(path.join(dirPath, file.name));
      filePathCopy.push(path.join(dirPathCopy, file.name));
    }
  }
  const mkDir = await mkdir(dirPathCopy, {recursive: true});
  console.log(dirPathCopy);
  for(let i = 0; i < filePath.length; i++) {
    const copy = await copyFile(filePath[i], filePathCopy[i]);
  }
})(folderPath, folderPathCopy);
