const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000 ;
const cors = require('cors')
const path = require('path')
const Filter = require('bad-words'),
        filter = new Filter();

const uri = "getyourrown"
const client = new MongoClient(uri);

app.use(cors());
let publicPath = path.resolve(__dirname, "public")
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+"/public/index.html"));
    res.send("Hello World!")
})

app.get('/write/:name/:score', (req, res) => {
    let name = req.params.name;
    let score = req.params.score;
    let filtered = filter.clean(name);
    console.log("Write " + filtered);
    console.log("Write " + req.params.score);
    add(filtered, score)
    res.send("written")
})

app.get('/read', (req, res) => {
    read(res);
});

// app.get('/drop/:db', (req, res) => {
//     drop(req.params.db);
//     res.send("Dropping");
// });

app.listen(port, () => {
    console.log(`Example app listening at localhost:${port}`)
});

async function read(res) {
    try {
        await client.connect();
        let dbo = client.db("snake_game");
        let collection = dbo.collection("scores");
        let options = {
            sort: {score: -1}
        };
        const cursor = collection.find({}, options).limit(10);
        if ((await cursor.count()) === 0) {
            res.send(JSON.stringify("No docs found"));
        } else {
            let results = await cursor.toArray()
            console.log(results);
            res.send(JSON.stringify(results));
        }
    } catch (e) {
        console.log(e);
    }
}

async function drop(db) {
    try {
        await client.connect();
        var dbo = client.db(db);
        await dbo.dropDatabase();
    } catch (e) {
        console.log(e);
    } finally {
        console.log("DB dropped")
    }
}

async function add(name, score) {
    try {
        await client.connect();

        await createListing(client,
            {
                name: name,
                score: parseInt(score)
            });
    } catch (e) {
        console.log(e);
    }
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function createListing(client, newListing) {
    const result = await client.db("snake_game").collection("scores").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);

}
