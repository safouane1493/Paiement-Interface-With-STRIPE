import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import ReactDOM from "react-dom";
import $ from 'jquery';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token : '',
      amount : 0,
      fullName : '',
      manyMonthBool : false,
      nbrMonth : null,
      amountToPayPerMonth : 0,
      perMonthLabel : ' / mois',
      cardFee: ''
    }
    this.submit = this.submit.bind(this);
  }

  async submit() {
 // let {token} = await this.props.stripe.createToken({name: "Name"});
let {token, amount, fullName, manyMonthBool, amountToPayPerMonth, nbrMonth} = this.state;
 if(token !== '' && amount !== 0){
 let amountPerMonthRounded = Number(amountToPayPerMonth + this.percentage(amountToPayPerMonth) + 0.25).toFixed(2);
 let response = await fetch("/api/donate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({token, amount, fullName, manyMonthBool, amountPerMonthRounded, nbrMonth})
  });
  
    console.log("resp: ",response)

  if (response.ok) console.log("Purchase Complete!")
}
}
handleChange =async (e) => {

  try{
    let {token} = await this.props.stripe.createToken();
    this.setState({token : token})
    this.props.cardInfoFunc(token.card)
   console.log('token: ',token);
  if(token){
    console.log("yess")
    let eurCountry = ['AL','AD','AM','AT','OE','BY','BE','BA','BG','CH','CY','CZ','DE','DK','EE','ES','FO','FI','FR','GB','GE','GI','GR','HU','HR','IE','IS','IT','LT','LU','LV','MC','MK','MT','NO','NL','PO','PT','RO','RU','SE','SI','SK','SM','TR','UA','VA']
    
    if(eurCountry.includes(token.card.country)){
     
      this.setState({cardFee : 'EUR'})
     
    }else{

      this.setState({cardFee : 'INTERNATIONAL'})

    }
  }
  }catch(e){
    throw e;
  }
};

percentage(num){

  if(this.state.cardFee === 'EUR'){

    return (num/100)*1.4;

  }else if(this.state.cardFee === 'INTERNATIONAL'){

      return (num/100)*2.9;

  }
 
 // 
}

handleChangeAmount = (e) => {

    
    this.setState({amount: e.target.value,amountToPayPerMonth: Number(this.state.amountToPayPerMonth + this.percentage(this.state.amountToPayPerMonth) + 0.25).toFixed(2)})
    // this.setState({})
   // this.props.nameInfoFunc(e);


}
handleChangeNom = (e) => {


    this.props.nameInfoFunc(e);
     this.setState({fullName: e.target.value})
     

}

  render() {
    return (
      <div className="checkout">
                 
          <input className="inputBox" type="text" name="montant" id="exampleMontant" placeholder="Montant (€) : 99.99" onChange={(e)=> this.handleChangeAmount(e)} required/>
    
        <CardElement 
            required="true"
            onChange={(e)=> this.handleChange(e)}
        />
       
          <input className="inputBox" type="text" name="nom" id="exampleNom" placeholder="Nom du titulaire de la carte" onChange={(e)=> this.handleChangeNom(e)} required/>

          
          <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" id="customControlValidation2" name="radio-stacked" onChange={(e)=> this.setState({manyMonthBool: false})} required />
            <label class="custom-control-label" for="customControlValidation2">Payer comptant</label>
           </div>
          <div class="custom-control custom-radio mb-3">
            <input type="radio" class="custom-control-input" id="customControlValidation3" name="radio-stacked" onChange={(e)=> this.setState({manyMonthBool: true})}  required />
            <label class="custom-control-label" for="customControlValidation3">Payer sur plusieurs fois</label>
          </div>

          {(this.state.manyMonthBool)?<div className="row"> <label style={{margin: 'auto',color: '#000',fontWeight: 'bold'}}>Sur combien de mois (entre 2 et 12)</label><p style={{fontSize: 10,margin: 'auto'}}><span style={{color: (this.state.cardFee ==='EUR')?'red': 'black'}}>(1,4 %  + 0,25 € )par mois
pour les cartes européennes</span><br /><span style={{color: (this.state.cardFee ==='INTERNATIONAL')?'red': 'black'}}>(2,9 %  + 0,25 €) par mois pour les cartes non européennes.</span></p><input className="inputBox col-md-6" type="number" name="nbr" id="exampleNbr" min="2" max="12" value={this.state.nbrMonth} placeholder="sur combien de mois (entre 2 et 12)" onChange={(e) => this.setState({nbrMonth : e.target.value,amountToPayPerMonth: (this.state.amount / e.target.value)})} required/>
                    <input className="inputBox col-md-6" type="text" name="montant" id="exampleMontant" value={Number(this.state.amountToPayPerMonth + this.percentage(this.state.amountToPayPerMonth) + 0.25).toFixed(2) + this.state.perMonthLabel} onChange={(e)=> this.handleChangeAmount(e)} style={{background: '#7d7c7c', color: '#FFF'}} disabled/></div>
 : null}
          

          
          <button style={{width: '80%'}} onClick={this.submit}>Payer</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
