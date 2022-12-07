import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: "omdb" });
console.log("Welcome to search-movies-cli!");

const myCLI = async () => {
  await client.connect();
  let chosenAction: string;
  let searchText: string;

  try {
    while (true) {
      chosenAction = await question(
        "[1] Search\n[2] See Favourites \n[3] Quit: \n"
      );
      if (chosenAction === "3") {
        break;
      }

      if (chosenAction === "1") {
        searchText = await question("\nSearch for a film\n");
        await search(searchText);
      }

      if (chosenAction === "2") {
        await displayFavourites();
      }
    }
  } catch (err) {
    console.error(err.stack);
  } finally {
    await client.end();
    console.log("DISCONNECTED");
  }
};
myCLI();

async function displayFavourites() {
  const queryResponse = await client.query(
    `SELECT movies.id, name, date, runtime, budget, revenue, vote_average, votes_count runtime FROM movies, favourites WHERE movies.id = favourites.movie_id`
  );
  console.table(queryResponse.rows);
}

async function search(searchText: string) {
  const text = `SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count runtime FROM movies WHERE LOWER(name) LIKE $1 ORDER BY date DESC LIMIT 10`;
  const values = [`%${searchText.toLowerCase()}%`];
  const queryResponse = await client.query(text, values);
  console.log(`\nRESULTS: \n`);

  if (queryResponse.rows.length > 0) {
    console.table(queryResponse.rows);
    console.log(displaySaveOptions(queryResponse.rows));
    const chosenFavouriteNum = await question(
      `\nChoose a film to add to favourites (1...10 OR 0 to CANCEL) `
    );

    if (chosenFavouriteNum !== "0" && Number(chosenFavouriteNum) < 11) {
      const chosenFilmObj = queryResponse.rows[Number(chosenFavouriteNum) - 1];
      console.log(`SAVING: ${chosenFilmObj.name} \n\n`);

      const addToFavouritesQuery = `INSERT INTO favourites (movie_id) VALUES ($1)`;
      const addToFavouritesValues = [chosenFilmObj.id];
      await client.query(addToFavouritesQuery, addToFavouritesValues);
    }
  } else {
    console.log("\nNO RESULTS \n");
  }
}

function displaySaveOptions(queryResponseArr: { [key: string]: string }[]) {
  for (const index in queryResponseArr) {
    const currentRow = queryResponseArr[index];
    console.log(`[${parseInt(index) + 1}]${currentRow.name}`);
  }
  console.log("[0] CANCEL");
  return "";
}
