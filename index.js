// import section
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();


// middlewares
app.use(cors())
app.use(express.json())

// mongodb operations

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bhwsqpg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const gameCollection = client.db('gameNote').collection('games')

async function run() {
    try {
        // get all services
        app.get('/services', async (req, res) => {
            const size = parseInt(req.query.size);
            const games = await gameCollection.find({}).limit(size).toArray();
            res.send(games)
        })
        // get specific service using id
        app.get('/services/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) }
            const service = await gameCollection.findOne(query);
            res.send(service);
        })
    }
    catch (error) {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send('assignment server is running');
})

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})

