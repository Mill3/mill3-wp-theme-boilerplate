import { promises as fs } from 'fs';
import sassVars from 'get-sass-vars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILENAME = `sass_vars.json`;
let json_data = {};

const PATHS = {
  dist: path.resolve(__dirname, OUTPUT_FILENAME),
  vars: path.resolve(__dirname, './vars/')
};

const storeData = async (data) => {
  try {
    await fs.writeFile(PATHS[`dist`], JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

const files = await fs.readdir(PATHS['vars'], (err, files) => files);

await Promise.all(files.map(async (file) => {
  // const name = file.split('.')[0]
  const contents = await fs.readFile(path.resolve(__dirname, './vars/', file), 'utf8')
  const sass = await sassVars(contents);
  Object.keys(sass).forEach((key) => {
    json_data[key] = sass[key];
  })
}));

await storeData(json_data)
console.log(`SASS vars to JSON data saved!`);



