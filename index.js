const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7k8mkis.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
            // all collection add
    const toyotaOptionCollection = client.db("reselling-Car").collection("toyota");
    const teslaOptionCollection = client.db("reselling-Car").collection("tesla");
    const bmwOptionCollection = client.db("reselling-Car").collection("bmw");
    const bmwBookingCollection = client.db("reselling-Car").collection("bmwbookings");


    // get bmw api data
    app.get('/bmw', async(req, res) =>{
        // const date = req.query.date;
        const query ={};
        const options = await bmwOptionCollection.find(query).toArray();
        res.send(options);
    })
    // get tesla data api
    app.get('/tesla', async(req, res) =>{
        // const date = req.query.date;
        const query ={};
        const options = await teslaOptionCollection.find(query).toArray();
        res.send(options);
    })
    //  get toyota api
    app.get('/toyota', async(req, res) =>{
        // const date = req.query.date;
        const query ={};
        const options = await toyotaOptionCollection.find(query).toArray();
        res.send(options);
    })

    // Post all data 
    app.post('/bmwbookings', async(req, res) =>{
        const bmwBooking = req.body
        console.log(bmwBooking)
        const result = await bmwBookingCollection.insertOne(bmwBooking);
        res.send(result);
    })
    

    }
    finally{
    
    }
}
run().catch(console.log);



app.get('/', async(req, res) =>{
    res.send('Car server is running')
})

app.listen(port, () => console.log(`Car server running on ${port}`))