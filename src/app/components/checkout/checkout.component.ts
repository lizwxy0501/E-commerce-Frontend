import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {



  checkoutFormGroup:FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYear: number[] = [];
  creditCardMonth: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService,
              private checkoutService: CheckoutService,
              private route: Router,
              private cartService: CartService){

    this.reviewCartDetails();


    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, 
                                        Validators.minLength(2),
                                        ShopValidators['notOnlyWhitespace']]),

        lastName: new FormControl('', [Validators.required, 
                                        Validators.minLength(2),
                                        ShopValidators['notOnlyWhitespace']]),

        email: new FormControl('', 
                              [Validators.required, 
                                Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, 
                                      Validators.minLength(2),
                                      ShopValidators['notOnlyWhitespace']]),
        city: new FormControl('', [Validators.required, 
                                    Validators.minLength(2),
                                    ShopValidators['notOnlyWhitespace']]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required, 
                                      Validators.minLength(2),
                                      ShopValidators['notOnlyWhitespace']]),
        state:new FormControl('', [Validators.required]),
      }),

      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, 
                                      Validators.minLength(2),
                                      ShopValidators['notOnlyWhitespace']]),
        city: new FormControl('', [Validators.required, 
                                    Validators.minLength(2),
                                    ShopValidators['notOnlyWhitespace']]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required, 
                                      Validators.minLength(2),
                                      ShopValidators['notOnlyWhitespace']]),
        state:new FormControl('', [Validators.required]),
      }),

      creditCard: this.formBuilder.group({
        cardType:new FormControl('', [Validators.required]),
        nameOnCard:new FormControl('', [Validators.required, 
                                          Validators.minLength(2),
                                          ShopValidators['notOnlyWhitespace']]),
        cardNumber:new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:[''],
      }),
    })

    //populate credit card month, current month zero-based
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.shopFormService.getCreditCardMonth(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )

    //populate credit card year
      this.shopFormService.getCreditCardYear().subscribe(
        data => {
          console.log("Retrieved credit card years: "+ JSON.stringify(data));
          this.creditCardYear = data;
        }
      );

      //populate countries
      this.shopFormService.getCountries().subscribe(
        data => {
          console.log("Retrieved countries: " + JSON.stringify(data))
          this.countries = data;
        }
      )




  }

  reviewCartDetails() {
    //subscribe to cartService.totalQuantity and totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() { return this.checkoutFormGroup.get('customer.lastName');}
  get email() { return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressZipcode() { return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state');}

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressZipcode() { return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state');}

  get creditCardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('creditCard.securityCode');}




  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order and get cart items
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;


    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(
      temp => new OrderItem(temp)
    );

    //set up purchase amd populate info
    let purchase = new Purchase();

    //customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;

    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;

    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`)

          //reset the cart
          this.resetCart();
        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    )



    // console.log(this.checkoutFormGroup.get('customer').value);
    // console.log("The email address is " + this.checkoutFormGroup.get('customer').value.email);
    // console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    // console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress').value.state.name);

  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.route.navigateByUrl("/products");

  }



  copyShippingAddress(event) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
      .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }

    }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currenYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    //if the current year equals the selected year, then start with the current month

    let startMonth: number;
    if (currenYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonth(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonth = data;
      }
    )
    }

    getStates(formGroupName: string) {
      const formGroup = this.checkoutFormGroup.get(formGroupName);
      const countryCode = formGroup.value.country.code;
      const countryName = formGroup.value.country.name;

      console.log(`${formGroupName} country code: ${countryCode}`)
      console.log(`${formGroupName} country name: ${countryName}`)

      this.shopFormService.getStates(countryCode).subscribe(
        data => {
          if (formGroupName === 'shippingAddress'){
            this.shippingAddressStates = data;
          }
          else {
            this.billingAddressStates = data;
          }

          // set first item by default
          formGroup.get('state').setValue(data[0]);
        }
      )
      }

}

