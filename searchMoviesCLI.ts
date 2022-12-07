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

            const text = `SELECT name, revenue, budget, votes_count, vote_average, runtime FROM movies WHERE LOWER(name) LIKE $1`
            const values = [`%${searchInput.toLowerCase()}%`]

            const queryResponse = await client.query(text, values);
            console.log(`RESULTS: \n`)
            console.table(queryResponse.rows); 
    }

    await client.end();
} 
myCLI();