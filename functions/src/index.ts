import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import QuickChart from 'quickchart-js';
import _data from "../data.json"

interface Data {
  [x: string]: string;
}

admin.initializeApp()

const database = admin.database();
const { ServerValue } = admin.database;
const errorRef = database.ref("stats/error")
const successRef = database.ref("stats/success")
const data: Data = _data as Data;

export default functions.https.onRequest(async (request, response) => {

  const name = request.query.name?.toString();

  response.set('Access-Control-Allow-Origin', '*');

  if (!name) {
    response.status(404).send('no name supplied');
    errorRef.child('no-name-supplied').set(ServerValue.increment(1));
    return;
  }

  const color = data[name];

  if (!color) {
    response.status(404).send('color not found');
    errorRef.child('color-not-found').set(ServerValue.increment(1));
    return;
  }

  response.status(200).send(color);
  successRef.child(name).set(ServerValue.increment(1));
});

export const graph = functions.https.onRequest(async (request, response) => {
  // const chart = new QuickChart();

  // chart.setWidth(500)
  // chart.setHeight(300);

  response.send(await successRef.orderByValue().limitToFirst(10).get())

  // chart.setConfig({
  //   "type": "bar",
  //   "data": {
  //     "labels": [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "May",
  //       "June",
  //       "July"
  //     ],
  //     "datasets": [
  //       {
  //         "type": "line",
  //         "label": "Dataset 1",
  //         "borderColor": "rgb(54, 162, 235)",
  //         "borderWidth": 2,
  //         "fill": false,
  //         "data": [
  //           -33,
  //           26,
  //           29,
  //           89,
  //           -41,
  //           70,
  //           -84
  //         ]
  //       }
  //     ]
  //   }
  // });

  // response.redirect(chart.getUrl())
})