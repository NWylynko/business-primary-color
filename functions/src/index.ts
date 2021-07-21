import * as functions from "firebase-functions";
import _data from "../data.json";

interface Data {
  [x: string]: string;
}

const initDataBase = async () => {
  const admin = await import("firebase-admin");
  const app = admin.apps[0] ?? admin.initializeApp();

  const database = app.database();
  const { ServerValue } = admin.database;
  const errorRef = database.ref("stats/error");
  const successRef = database.ref("stats/success");

  const errorNOName = () => {
    return errorRef.child("no-name-supplied").set(ServerValue.increment(1));
  };

  const errorNOColor = () => {
    return errorRef.child("color-not-found").set(ServerValue.increment(1));
  };

  const success = (name: string) => {
    return successRef.child(name).set(ServerValue.increment(1));
  };

  return {
    database,
    errorRef,
    ServerValue,
    successRef,
    errorNOName,
    errorNOColor,
    success,
  };
};

const data: Data = _data as Data;

const remove = (text: string, filterItems: string[]) => {
  return filterItems.reduce((newText, filterItem) => newText.replace(filterItem, ""), text)
}

export default functions.https.onRequest(async (request, response) => {
  const name = request.query.name?.toString();

  response.set("Access-Control-Allow-Origin", "*");

  if (!name) {
    response.status(404).send("no name supplied");
    (await initDataBase()).errorNOName()
    return;
  }

  const color = data[name];

  if (!color) {
    response.status(404).send("color not found");
    (await initDataBase()).errorNOColor()
    return;
  }

  response.status(200).send(color);
  (await initDataBase()).success(remove(name, [".", "#", "$", "[", "]"]));
});

export const graph = functions.https.onRequest(async (request, response) => {
  const QuickChart = (await import("quickchart-js")).default;

  const chart = new QuickChart();

  chart.setWidth(500);
  chart.setHeight(300);

  const labels: string[] = [];
  const data: number[] = [];

  (await initDataBase()).successRef
    .orderByValue()
    .limitToLast(10)
    .once("value", (snapshots) => {
      snapshots.forEach((snapshot) => {
        labels.push(snapshot.key || "");
        data.push(snapshot.val());
      });

      chart.setConfig({
        type: "line",
        data: {
          labels: labels.reverse(),
          datasets: [
            {
              type: "line",
              label: "Top 10 Badges",
              borderColor: "rgb(54, 162, 235)",
              borderWidth: 2,
              fill: false,
              data: data.reverse(),
            },
          ],
        },
      });

      response.redirect(chart.getUrl());
    });
});
