const express = require("express");
const stripeLoader = require("stripe");

const routers = express.Router();

routers.get('/api/hello', (req, res, next) =>{
    res.json('world');
    console.log("helllllloooooooooo")
})

const stripe = new stripeLoader('sk_test_zXzD60O5l1grOzFOBhnj3n4j008BFzveW1');

const customer = (token, name, plan, nbrMonth) => {

    stripe.customers.create({
        name: name,
    source: token,
    },
        function(err, customer) {
           console.log("cust: ",customer)
           if(nbrMonth != 0){
                 subscription(customer.id,plan.id, nbrMonth)
           }
          
        });
};


const customerCharge = (token, amt, fullName) => {

    stripe.customers.create({
        name: fullName,
    source: token,
    },
        function(err, customer) {
           console.log("cust: ",customer)
          
            charge(token,amt)
//plan(token,fullName,amt)
          
        });
};

const subscription = (customerId,planId, nbrMonth) => {

    return stripe.subscriptions.create({
  customer: customerId,
  items: [
    {
      plan: planId,
    },
  ]
}, function(err, subscription) {
    console.log("subsc: ",subscription)
     console.log("subsc created: ",subscription.created)

let dateCreation = new Date(subscription.created * 1000)
let dateToCancelMonth = new Date(dateCreation.setMonth( dateCreation.getMonth()+ (nbrMonth - 1) ))
let dateToCancelMonthHours = dateToCancelMonth.setHours( dateToCancelMonth.getHours()+2 ) / 1000
console.log("subsc ends: ",dateToCancelMonthHours)
    stripe.subscriptions.update(
        subscription.id,
        {cancel_at_period_end: true},
        function(err, subscription) {
            stripe.subscriptions.update(
                subscription.id,
                {cancel_at: dateToCancelMonthHours},
                function(err, subscription) {
                    console.log("END")
                }
    );
            
        }
);

  });
    }

const plan = (token,name,amt,nbrMonth =0) => {

    return stripe.plans.create({
        amount: amt * 100,
        interval: "month",
        product: {
            name: "Envoi d\'argent"
        },
        currency: "eur",
        },
        function(err, plan) {
           console.log("plan: ",plan)
           if(nbrMonth != 0){
           customer(token,name,plan,nbrMonth)}
        });
    }

const charge = (token, amt, fullName) => {
     console.log('token: ',token)
      console.log('amt: ',amt)
    return stripe.charges.create({
        amount: amt * 100,
        currency: 'eur',
        source: token,
        description: 'Paiement Comptant'

    },function(err, charge) {
          console.log('charge: ',charge)
          stripe.charges.update(
                charge.id,
                {metadata: {CustomerName: fullName}},
                function(err, charge) {
                    console.log('charge updated: ',charge)
                }
                );
        });
};

const card = (token) => {

    return stripe.customers.createSource(
        'cus_FsKHXIyjb81y8C',
        {
            source: token,
        },
        function(err, card) {
           return card;
        }
    );
};


routers.post("/api/donate", async (req, res, next) => {

    try{
       if(req.body.manyMonthBool){
           console.log("amountToPayPerMonth: "+req.body.amountPerMonthRounded)
           console.log("manyMonthBool: "+req.body.manyMonthBool)
          //  let amoutPerMonthRounded = Number(req.body.amountToPayPerMonth).toFixed(2)
          //  console.log("amoutPerMonthRounded: "+amoutPerMonthRounded)


            let dataPlan = await plan(req.body.token.id,req.body.fullName,req.body.amountPerMonthRounded,req.body.nbrMonth);
        }else{
            console.log("charge comptant")
         //  let dataPlan = await customerCharge(req.body.token.id,req.body.amount,req.body.fullName);
            let dataChagre = await charge(req.body.token.id,req.body.amount,req.body.fullName);
    }


        res.send("Charged!")
    }catch(e){
        // console.log("Error:", e);
          res.status(500)

    }
//   let amount = 500;

//   stripe.customers.create({
//     email: req.body.email,
//     card: req.body.id
//   })
//   .then(customer =>
//     stripe.charges.create({
//       amount,
//       description: "Sample Charge",
//       currency: "usd",
//       customer: customer.id
//     }))
//   .then(charge => res.send(charge))
//   .catch(err => {
//     console.log("Error:", err);
//     res.status(500).send({error: "Purchase Failed"});
//   });
});

module.exports = routers