import * as functions from "firebase-functions";
import { promises as fs } from 'fs';
import * as path from "path"

interface Data {
  [x: string]: string;
}

const data: Data = JSON.parse(await fs.readFile(path.resolve('./data.json'), 'utf-8'));

export default functions.https.onRequest(async (request, response) => {

  const name = request.query.name?.toString();

  if (!name) {
    throw new Error('no name supplied')
  }

  const color = data[name];

  if (!color) {
    throw new Error('color not found')
  }

  response.set('Access-Control-Allow-Origin', '*');

  response.send(color);
});
