import fetch from "node-fetch";
import { promises as fs } from "fs";

const url =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/_data/simple-icons.json";

const localFile = "data.json";
const functionsFile = "../functions/data.json";

interface BaseIcon {
  icons: Icon[];
}

interface Icon {
  title: string;
  hex: string;
  source: string;
  guidelines: string;
}

(async () => {
  try {
    const { icons: newJson }: BaseIcon = await (await fetch(url)).json();

    try {
      const oldJson: Icon[] = JSON.parse(await fs.readFile(localFile, "utf-8"));

      if (Equal(oldJson, newJson)) {
        // exit if the file hasn't changed
        console.log("file hasn't changed");
        process.exit(1);
      } else {
        // write the new file for later and continue
        console.log("file has changed");
        await saveData(newJson);
      }
    } catch (error) {
      // if there is an error with the old file just replace it and continue
      await saveData(newJson);
      throw new Error(`couldn't read old data json file: ${error}`);
    }
  } catch (error) {
    throw new Error(`error fetching icons json file: ${error}`);
  }
})();

interface Data {
  [x: string]: string;
}

async function saveData(newData: Icon[]): Promise<void> {
  const dataObject: Data = {};

  newData.forEach((item) => {
    dataObject[item.title] = item.hex;
  });

  await fs.writeFile(localFile, JSON.stringify(newData));
  await fs.writeFile(functionsFile, JSON.stringify(dataObject));
}

function Equal(object1: Icon[], object2: Icon[]) {
  return JSON.stringify(object1) === JSON.stringify(object2);
}
