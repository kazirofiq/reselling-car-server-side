const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7k8mkis.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

// // Note: make sure you use verifyAdmin after verifyJWT
// const verifyAdmin = async(req, res, next) =>{

//     console.log('inside verifyAdmin', req.decoded.email)
//     const decodedEmail = req.decoded.email;
//     const query = {email: decodedEmail};
//     const user = await usersCollection.findOne(query);
//     if(user?.role !== 'admin'){
//         return res.status(403).send({message: 'forbidden access'})
//     }
//     next();
// } 

async function run(){
    try{
            // all collection add
    const toyotaOptionCollection = client.db("reselling-Car").collection("toyota");
    const teslaOptionCollection = client.db("reselling-Car").collection("tesla");
    const bmwOptionCollection = client.db("reselling-Car").collection("bmw");
    const bookingCollection = client.db("reselling-Car").collection("bookings");
    const usersCollection = client.db("reselling-Car").collection("users");

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

    // get bookings api
    app.get('/bookings', verifyJWT, async(req, res) =>{
        const email = req.query.email;
        const decodedEmail = req.decoded.email;

        if(email !== decodedEmail){
            return res.status(403).send({message: 'forbidden access'});
        }
        console.log(email)
        const query ={email: email};
        const bookings = await bookingCollection.find(query).toArray();
        res.send(bookings);
    })

    // Post all data 
    app.post('/bookings', async(req, res) =>{
        const booking = req.body
        console.log(booking)
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    })

     // jwt token
     app.get('/jwt', async(req, res) =>{
        const email = req.query.email;
        
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        console.log(user);
        
        if(user){
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
            return res.send({accessToken: token});
        }  
        res.status(403).send({accessToken: ''})
    })
        // get all users
        app.get('/users', async(req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })
    app.post('/users', async(req, res) =>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);

    })

     // make admin panel
     app.put('/users/admin/:id',verifyJWT, async(req, res) =>{
        const id = req.params.id;
        const filter ={_id: ObjectId(id) }
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
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