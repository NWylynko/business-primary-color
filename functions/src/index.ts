import * as functions from "firebase-functions";
import { promises as fs } from 'fs';
import * as path from "path"

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

interface Data {
  [x: string]: string;
}

export default functions.https.onRequest(async (request, response) => {

  const data: Data = JSON.parse(await fs.readFile(path.resolve('./data.json'), 'utf-8'));

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