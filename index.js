// import section
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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
const gameCollection = client.db('gameNote').collection('games');
const reviewCollection = client.db('gameNote').collection('reviews')

async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unathorized access")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send("unathorized access")
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        // jwt token implement
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

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
        // add reviews to database using post method
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        // get specific reviews using query
        app.get('/reviews', async (req, res) => {
            const query = { serviceName: req.query.service }
            const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews)
        })

        // get all reviews of a user using email query
        app.get('/myreview', verifyJWT, async (req, res) => {
            const query = { email: req.query.email }
            const decodedData = req.decoded.email
            if (req.query.email === decodedData) {
                const myReviews = await reviewCollection.find(query).toArray()
                res.send(myReviews)
            }
        })

        // delete specific review from database
        app.delete('/myreview/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const result = await reviewCollection.deleteOne(filter)
            res.send(result)
        })

        // update specific review form database
        app.patch('/myreview/:id', async (req, res) => {
            const newDescription = req.body.description;
            const query = { _id: ObjectId(req.params.id) }
            const updatedDoc = {
                $set: { description: newDescription }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc)
            res.send(result)
        })

        // add service to database
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await gameCollection.insertOne(service);
            res.send(result)
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

