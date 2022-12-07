import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
const client = new Client({ database: 'omdb' });
console.log("Welcome to search-movies-cli!");


const myCLI = async () => {
    await client.connect();
    let searchInput: string;

    while (true) {
            searchInput = await question('Type in a film name: \n')
            if (searchInput === 'q') {
                break;
            }

            const text = `SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count runtime FROM movies WHERE LOWER(name) LIKE $1 ORDER BY date DESC LIMIT 10`
            const values = [`%${searchInput.toLowerCase()}%`]

            const queryResponse = await client.query(text, values);
            console.log(`\nRESULTS: \n`)

            if (queryResponse.rows.length > 0) {
                console.table(queryResponse.rows); 
            } else {
                console.log("\nNO RESULTS \n")
            }
    }

    await client.end();
} 
myCLI();