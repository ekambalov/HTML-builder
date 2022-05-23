const { readdir, mkdir, copyFile, unlink, rmdir } = require('fs/promises');
const path = require('path');
const fs = require('fs');
const {createWriteStream, createReadStream} = fs;

const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const projectDistPath = path.join(__dirname, 'project-dist');
let componentsInHTML = [];
let components = [];


// making string from file:
async function getData (filePath) {
  let chunks = [];  
  const readStream = createReadStream(filePath);
  for await (const chunk of readStream) {
    chunks.push(chunk);
  }
  return chunks.join('\n').toString();
}

// recurcive function for Copy Directory
async function CopyDir(dirPath, dirPathCopy) {
  
  async function clearDir(directory) {
    const files = await readdir(directory, { withFileTypes: true });
    for (const file of files) {
      if(file.isFile()){
        await unlink(path.join(directory, file.name));
      } else {
        await clearDir(path.join(directory, file.name));  
        await rmdir(path.join(directory, file.name));
      }
    }
  }
  await mkdir(dirPathCopy, {recursive: true});
  await clearDir(dirPathCopy);
  let filePath =[];
  let filePathCopy =[];
  const files = await readdir(dirPath, { withFileTypes: true });
  for(const file of files){
    let origPath = path.join(dirPath, file.name);
    let copyPath = path.join(dirPathCopy, file.name);
    if(file.isFile()){
      filePath.push(origPath);
      filePathCopy.push(copyPath);
    } else {
      await CopyDir(origPath, copyPath);
    }
  }
  
  for(let i = 0; i < filePath.length; i++) {
    await copyFile(filePath[i], filePathCopy[i]);
  }
}

// main code:
(async () => {

  let template = await getData(templatePath); // made template variable

  // finding components tag:

  let pos = -1;
  let condition = true;  
  while (condition) {

    let startPose = template.indexOf('{{', pos);
    if (startPose === -1) break;
    let endPose = template.indexOf('}}', startPose);
    if (endPose === -1) break;

    componentsInHTML.push({
      name: template.slice(startPose+2, endPose).trim(),
      startPose: startPose,
      endPose: endPose + 2,        
    });

    pos = startPose + 1;
  }

  // making variable for compinents

  for( const component of componentsInHTML){
    let componentData = await getData(path.join(componentsPath, component.name + '.html'));
    components.push({
      data: componentData,
      name: component.name
    });
  }

  // making index.html

  let indexHTML = template.slice(0, componentsInHTML[0].startPose);
  
  for (let i = 0; i < componentsInHTML.length; i++){
    if(i === componentsInHTML.length - 1){  
      indexHTML += components[i].data + template.slice(componentsInHTML[i].endPose);
    } else {
      indexHTML += components[i].data + template.slice(componentsInHTML[i].endPose, componentsInHTML[i + 1].startPose);
    }
  }
  
  await mkdir(projectDistPath, {recursive: true});
  const indexHTMLStream = createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
  
  indexHTMLStream.write(indexHTML);

  // Copy assets files:
  let assetsPath = path.join(__dirname, 'assets');
  let assetsPathCopy = path.join(__dirname, 'project-dist', 'assets');

  await CopyDir(assetsPath, assetsPathCopy);

  // making css file:

  const styleDistPath = path.join(projectDistPath, 'style.css');
  const styleOrigPath = path.join(__dirname, 'styles');
  const styleWriteStream = createWriteStream(
    styleDistPath,
    'utf-8',
  );
  
  let stylesData = [];

  const styleFiles = await readdir(styleOrigPath, { withFileTypes: true });

  for(const file of styleFiles){
    if(file.isFile()){ 
      const fileParse = path.parse(path.join(styleOrigPath, file.name));
      if(fileParse.ext === '.css'){
        let styleComponent = await getData(path.join(styleOrigPath, file.name));
        stylesData.push(styleComponent);
      }  
    }
  }
  
  await styleWriteStream.write(stylesData.join('\n').toString());

})();