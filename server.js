
const express = require('express');
const app = express();
const APIrouter = require('./routes/api')
const SwaggerRouter = require('./routes/swagger')

app.use(express.json());
app.use('/api', APIrouter);

app.use('/api-docs', SwaggerRouter);


app.listen(3000, ()=>{
    console.log('app is listening on 3000')
});




