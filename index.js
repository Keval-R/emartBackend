const express = require('express')
var cors = require('cors')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const { async } = require('rxjs');

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
const YOUR_DOMAIN = 'http://localhost:3000';
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const stripe = require('stripe')('sk_test_51LFB7YSHaPW2YZDs1HRMdtLok4zJ6TuSgtlG4REUBhZH3QzEvglRKHf8HgnF9PqNbsokkq20Alw5Jli7q774K3Mf00WJGoQu9m');

app.post('/create-checkout-session', async (req, res) => {
  let product_data = req.body;
  let allProduct = [];
  for (i = 0; i < product_data.data.length; i++) {
    let json = {
      price_data: {
        currency: 'inr',
        product_data: {
          name: product_data.data[i]['ProviderArtNo'],
          images: [product_data.data[i]['url_img']]
        },
        unit_amount: parseInt(product_data.data[i]['Price']) * 10,
      },
      quantity: product_data.data[i]['qty'],
    }

    allProduct.push(json)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: allProduct,
    mode: 'payment',
    success_url: 'http://192.168.1.101:4200/order-status?status=true',
    cancel_url: 'http://192.168.1.101:4200/order-status?status=false',
  });
  // res.redirect(303, session.url);
  res.json({ id: session.id });
});


app.post('/login',async (req, res) => {
  let data = req.body.data;
  if(data.email == "test@test.com" && data.password == "test"){
    res.json({status: 200, msg: "Sucessfully logged in."});
  }else{
    res.json({status: 401, msg: "Email id or password incorrect.Please try again."});
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})