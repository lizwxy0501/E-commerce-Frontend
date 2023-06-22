import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {


  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem) {
    //check if we already have the item in the cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem : CartItem = undefined;

    //find the item based on id
    if (this.cartItems.length > 0) {
    existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
  }

    //replaced by the find method    
    //   for (let temp of this.cartItems){
    //     if (temp.id === theCartItem.id){
    //       existingCartItem = temp;
    //       break;
    //     }
    //   }

  //check if we found it  
  alreadyExistsInCart = (existingCartItem != undefined);

    if (alreadyExistsInCart) {
      existingCartItem.quantity ++;
    }
    else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals(); 


  }
  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    //publish the new values to all subscribers, send event, update?
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data for debuggung purpose
    this.logCartData(totalPriceValue, totalQuantityValue);
  }


  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Content of the cart: ');
    for (let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name:${tempCartItem.name}, quantity:${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);

    }

    //two digits after decimal
    console.log(`totalPrice:${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('---END---')
  }


  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity --;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }


  remove(theCartItem: CartItem) {
    //get index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    //if found, remove the item from the array
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}
