const { readdir} = require('fs/promises');
const path = require('path');
const fs = require('fs');

const folderPath = path.join(__dirname, 'styles');
const filePathBundle = path.join(__dirname, 'project-dist', 'bundle.css');
let stylesData = [];

const writeStream = fs.createWriteStream(
  filePathBundle,
  'utf-8',
);

async function copyData (filePath) {
  const readStream = fs.createReadStream(filePath);
  for await (const chunk of readStream) {
    stylesData.push(chunk);
  }
}


(async (dirPath) => {
  const files = await readdir(dirPath, { withFileTypes: true });
  for(const file of files){
    if(file.isFile()){ 
      const fileParse = path.parse(path.join(dirPath, file.name));
      if(fileParse.ext === '.css'){
        await copyData(path.join(dirPath, file.name));
      }  
    }
  }
  writeStream.write(stylesData.join('\n').toString());

})(folderPath);