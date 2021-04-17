import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import _data from "../data.json"

interface Data {
  [x: string]: string;
}

admin.initializeApp()

const database = admin.database();
const errorRef = database.ref("stats/error")
const successRef = database.ref("stats/success")
const data: Data = _data as Data;

export default functions.https.onRequest(async (request, response) => {

  const name = request.query.name?.toString();

  response.set('Access-Control-Allow-Origin', '*');

  if (!name) {
    response.status(404).send('no name supplied');
    errorRef.child('no-name-supplied').push({
      likes: admin.database.ServerValue.increment(1)
    });
    return;
  }

  const color = data[name];

  if (!color) {
    response.status(404).send('color not found');
    errorRef.child('color-not-found').push({
      likes: admin.database.ServerValue.increment(1)
    });
    return;
  }

  response.status(200).send(color);
  successRef.child(name).push({
      likes: admin.database.ServerValue.increment(1)
    });
});
