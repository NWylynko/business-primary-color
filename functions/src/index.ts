import * as functions from "firebase-functions";
import _data from "../data.json"

interface Data {
  [x: string]: string;
}

export default functions.https.onRequest(async (request, response) => {

  const data: Data = _data as Data;

  const name = request.query.name?.toString();

  response.set('Access-Control-Allow-Origin', '*');

  if (!name) {
    response.status(404).send('no name supplied');
    return;
  }

  const color = data[name];

  if (!color) {
    response.status(404).send('color not found');
    return;
  }

  response.status(200).send(color);
});
