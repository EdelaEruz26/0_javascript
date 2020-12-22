
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
    let wData = fs.readFileSync('./warehouse.txt', 'utf8');

    let wProducts = JSON.parse(wData);
    let queryRes = wProducts.filter(product => product[filter] === keyword);

    res.send(queryRes);
})

app.get('/warehouse', (req, res) => {
    let wData = fs.readFileSync('./warehouse.txt', 'utf8');
    let wProducts = JSON.parse(wData);
    res.send(wProducts);
})

app.get('/cart', (req, res) => {
    let cData = fs.readFileSync('./cart.txt', 'utf8');
    
    let cProducts = JSON.parse(cData);
    res.send(cProducts);
})

app.delete('/cart', (req, res) => {
    fs.writeFileSync('./cart.txt', '[]');
    res.send('cart emptied');
})

app.post('/cart/products/:product', (req, res) => {
    let cData = fs.readFileSync('./cart.txt', 'utf8');
    let cProducts = JSON.parse(cData);
    
    let nProduct = JSON.parse(req.params.product);
    const index = cProducts.findIndex(product => product.id === nProduct.id);

    // check if already exists
    if(index === -1){
        cProducts.push(nProduct);
    }else{
        cProducts.splice(index, 1, nProduct);
    }

    fs.writeFileSync('./cart.txt', '');
    fs.writeFileSync('./cart.txt', JSON.stringify(cProducts)); 

    res.send('cart product(s) added');
})

app.put('/cart/products/:id/:quantity', (req, res) => {
    let cData = fs.readFileSync('./cart.txt', 'utf8');
    let cProducts = JSON.parse(cData);
    
    let quant = parseInt(req.params.quantity);
    let productId = parseInt(req.params.id);

    // get the index and product
    const index = cProducts.findIndex(product => product.id === productId);
    const match = cProducts[index];

    match.quantity = quant;

    cProducts.splice(index, 1, match);

    fs.writeFileSync('./cart.txt', '');
    fs.writeFileSync('./cart.txt', JSON.stringify(cProducts));
    res.send('cart product updated');
})

app.delete('/cart/products/:id/', (req, res) => {
    let cData = fs.readFileSync('./cart.txt', 'utf8');
    let cProducts = JSON.parse(cData);
    
    let productId = parseInt(req.params.id);

    // get the index
    const index = cProducts.findIndex(product => product.id === productId);

    cProducts.splice(index, 1);

    fs.writeFileSync('./cart.txt', '');
    fs.writeFileSync('./cart.txt', JSON.stringify(cProducts));
    res.send('cart product deleted');
})

app.post('/checkout', (req, res) => {
    let msg = '';
    let total = 0;
    let errFlag = 0;
    let cData = fs.readFileSync('./cart.txt', 'utf8');
    let cProducts = JSON.parse(cData);

    let wData = fs.readFileSync('./warehouse.txt', 'utf8');
    let wProducts = JSON.parse(wData);

    // check if a product's quantity exceeds the warehouse quantity
    cProducts.forEach(product => {
        let index = wProducts.findIndex(wProd => wProd.id === product.id)
        total += parseInt(wProducts[index].price) * product.quantity;
        if(product.quantity > wProducts[index].quantity){
            errFlag = 1;
        }
    });
    
    if(errFlag === 0){
        
        cProducts.forEach(product => {
            let index = wProducts.findIndex(wProd => wProd.id === product.id)
            wProducts[index].quantity -= product.quantity;
        });

        msg = 'checked out. total was ' + total;
        fs.writeFileSync('./cart.txt', '[]');
        fs.writeFileSync('./warehouse.txt', '');
        fs.writeFileSync('./warehouse.txt', JSON.stringify(wProducts));

    }else{
        msg = 'error. one or more products exceed warehouse quantity'
    }
    
    res.send(msg);
})

