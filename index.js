require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT;	 	
const host = process.env.HOST; 	

const corsOptions = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOptions));
app.use(express.json());
// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'Welcome to SomeHelpingHands REST API' });
});

// routing middleware
app.use('/users', require('./routes/user.routes.js'))
app.use('/posts', require('./routes/post.routes.js'))
app.use('/categories', require('./routes/category.routes.js'))


// handle invalid routes
app.get('*', function (req, res) {
    res.status(404).json({ message: 'WHAT???' });
})
app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
