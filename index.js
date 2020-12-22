
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('everything aight');
})

app.get('/warehouse/:filter/:keyword', (req, res) => {
    let filter = req.params.filter;
    let keyword = req.params.keyword;
    let wData = fs.readFileSync('./warehouse.txt', 'utf8')

    wProducts = JSON.parse(wData);
    queryRes = wProducts.filter(product => product[filter] === keyword);

    res.send(queryRes);
})



