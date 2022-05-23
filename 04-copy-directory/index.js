const { readdir, mkdir, copyFile, unlink } = require('fs/promises');
const path = require('path');

const folderPath = path.join(__dirname, 'files');
const folderPathCopy = path.join(__dirname, 'files-copy');



(async (dirPath, dirPathCopy) => {
  
  async function clearDir(directory) {
    const files = await readdir(directory);
    for (const file of files) {
      unlink(path.join(directory, file));
    }
  }

  let filePath =[];
  let filePathCopy =[];
  const files = await readdir(dirPath, { withFileTypes: true });
  for(const file of files){
    if(file.isFile()){
      filePath.push(path.join(dirPath, file.name));
      filePathCopy.push(path.join(dirPathCopy, file.name));
    }
  }
  await mkdir(dirPathCopy, {recursive: true});
  await clearDir(dirPathCopy);
  for(let i = 0; i < filePath.length; i++) {
    await copyFile(filePath[i], filePathCopy[i]);
  }
})(folderPath, folderPathCopy);
