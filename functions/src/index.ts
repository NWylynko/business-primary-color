import * as functions from "firebase-functions";
import _data from "../data.json"

interface Data {
  [x: string]: string;
}

export default functions.https.onRequest(async (request, response) => {

  const data: Data = _data as Data;

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
