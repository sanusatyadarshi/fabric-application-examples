/*
 Copyright 2018 IBM All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an 'AS IS' BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

'use strict';
const { Contract } = require('fabric-contract-api');
const util = require('util');

module.exports = class CarAuction extends Contract {

  /**
   * The initLedger method is called as a result of instantiating chaincode. 
   * It can be thought of as a constructor for the network. For this network 
   * we will create 3 members, a vehicle, and a vehicle listing.
   */
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');

    let member1 = {};
    member1.balance = 5000;
    member1.firstName = 'Amy';
    member1.lastName = 'Williams';
    console.info('======After member ===========');

    let member2 = {};
    member2.balance = 5000;
    member2.firstName = 'Billy';
    member2.lastName = 'Thompson';

    let member3 = {};
    member3.balance = 5000;
    member3.firstName = 'Tom';
    member3.lastName = 'Werner';

    let vehicle = {};
    vehicle.owner = 'memberA@acme.org';

    let vehicleListing = {};
    vehicleListing.reservePrice = 3500;
    vehicleListing.description = 'Arium Nova';
    vehicleListing.listingState = 'FOR_SALE';
    vehicleListing.offers = '';
    vehicleListing.vehicle = '1234';

    await ctx.stub.putState('memberA@acme.org', Buffer.from(JSON.stringify(member1)));
    await ctx.stub.putState('memberB@acme.org', Buffer.from(JSON.stringify(member2)));
    await ctx.stub.putState('memberC@acme.org', Buffer.from(JSON.stringify(member3)));
    await ctx.stub.putState('1234', Buffer.from(JSON.stringify(vehicle)));
    await ctx.stub.putState('ABCD', Buffer.from(JSON.stringify(vehicleListing)));

    console.info('============= END : Initialize Ledger ===========');
  }

  /**
   * Query the state of the blockchain by passing in a key  
   * @param arg[0] - key to query 
   * @return value of the key if it exists, else return an error 
   */
  async query(ctx, queryKey) {
    console.info('============= START : Query method ===========');


    let queryAsBytes = await ctx.stub.getState(queryKey); //get the car from chaincode state
    if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
      throw new Error('key' +queryKey+ ' does not exist: ');
    }
    console.info('query response: ');
    console.info(queryAsBytes.toString());
    console.info('============= END : Query method ===========');

    return queryAsBytes;

  }


  /**
   * Create a vehicle object in the state  
   * @param arg[0] - key for the car (vehicle id number)
   * @param arg[1] - owner of the car - should reference the email of a member
   * onSuccess - create and update the state with a new vehicle object  
   */
  async createVehicle(ctx, key,owner) {
    console.info('============= START : Create Car ===========');

    var car = {
      owner
    };

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(car)));
    console.info('============= END : Create Car ===========');
  }

  /**
   * Create a vehicle listing object in the state  
   * @param arg[0] - key for the vehicle listing (listing number)
   * @param arg[1] - reservePrice, or the minimum acceptable offer for a vehicle
   * @param arg[2] - description of the object
   * @param arg[3] - state of the listing, can be 'FOR_SALE', 'RESERVE_NOT_MET', or 'SOLD'
   * @param arg[4] - an array of offers for this particular listing
   * @param arg[5] - reference to the vehicle id (vin) which is to be put on auction
   * onSuccess - create and update the state with a new vehicle listing object  
   */
  async createVehicleListing(ctx, key,reservePrice,description,listingState,offers,vehicle) {
    console.info('============= START : Create Car ===========');

    var vehicleListing = {
      reservePrice,
      description,
      listingState,
      offers,
      vehicle
    };

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(vehicleListing)));
    console.info('============= END : Create Car ===========');
  }

  /**
   * Create a member object in the state  
   * @param arg[0] - key for the member (email)
   * @param arg[1] - first name of member
   * @param arg[2] - last name of member
   * @param arg[3] - balance: amount of money in member's account
   * onSuccess - create and update the state with a new member  object  
   */
  async createMember(ctx, key,firstName,lastName,balance) {
    console.info('============= START : Create Car ===========');
    
    var member = {
      firstName,lastName,balance
    };

    console.info(member);

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(member)));
    console.info('============= END : Create Car ===========');
  }

  /**
   * Create a offer object in the state, and add it to the array of offers for that listing  
   * @param arg[0] - bid price in the offer - how much bidder is willing to pay
   * @param arg[1] - listingId: reference to a listing in the state
   * @param arg[2] - member email: reference to member which does not own vehicle
   * onSuccess - create and update the state with a new offer object  
   */
  async makeOffer(ctx, bidPrice,listing,member) {
    console.info('============= START : Create Car ===========');

    var offer = {
      bidPrice,
      listing,
      member
    };

    console.info('listing: ' + listing);

    //get reference to listing, to add the offer to the listing later
    let listingAsBytes = await ctx.stub.getState(listing);
    if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
      throw new Error('listing does not exist');
    }
    listing = JSON.parse(listingAsBytes);

    //get reference to vehicle, to update it's owner later
    let vehicleAsBytes = await ctx.stub.getState(listing.vehicle);
    if (!vehicleAsBytes || vehicleAsBytes.toString().length <= 0) {
      throw new Error('vehicle does not exist');
    }

    let vehicle = JSON.parse(vehicleAsBytes);

    //get reference to member to ensure enough balance in their account to make the bid
    let memberAsBytes = await ctx.stub.getState(offer.member); 
    if (!memberAsBytes || memberAsBytes.toString().length <= 0) {
      throw new Error('member does not exist: ');
    }
    let member = JSON.parse(memberAsBytes);

    //check to ensure bidder has enough balance to make the bid
    if (member.balance < offer.bidPrice) {
      throw new Error('The bid is higher than the balance in your account!');
    }

    console.info('vehicle: ');
    console.info(util.inspect(vehicle, { showHidden: false, depth: null }));
    console.info('offer: ');
    console.info(util.inspect(offer, { showHidden: false, depth: null }));

    //check to ensure bidder can't bid on own item
    if (vehicle.owner == offer.member) {
      throw new Error('owner cannot bid on own item!');
    }

    console.info('listing response before pushing to offers: ');
    console.info(listing);
    
    //check to see if array is null - if so, we have to create an empty one, otherwise we can just push straight to it
    if (!listing.offers) {
      console.info('there are no offers!');
      listing.offers = [];
    }
    listing.offers.push(offer);

    console.info('listing response after pushing to offers: ');
    console.info(listing);
    
    //update the listing - use listingId as key, and listing object as value
    await ctx.stub.putState(listingId, Buffer.from(JSON.stringify(listing)));

    console.info('============= END : MakeOffer method ===========');

  }

  /** 
   * Close the bidding for a vehicle listing and choose the
   * highest bid as the winner. 
   * @param arg[0] - listingId - a reference to our vehicleListing
   * onSuccess - changes the ownership of the car on the auction from the original
   * owner to the highest bidder. Subtracts the bid price from the highest bidder 
   * and credits the account of the seller. Updates the state to include the new 
   * owner and the resulting balances. 
   */
  async closeBidding(ctx, listingKey) {
    console.info('============= START : Close bidding ===========');

    //check if listing exists
    let listingAsBytes = await ctx.stub.getState(listingKey);
    if (!listingAsBytes || listingAsBytes.toString().length <= 0) {
      throw new Error('listing does not exist: ');
    }
    console.info('============= listing exists ===========');

    var listing = JSON.parse(listingAsBytes);
    console.info('listing: ');
    console.info(util.inspect(listing, { showHidden: false, depth: null }));
    listing.listingState = 'RESERVE_NOT_MET';
    let highestOffer = null;

    //can only close bidding if there are offers
    if (listing.offers && listing.offers.length > 0) {
      
      //use built in JavaScript array sort method - returns highest value at the first index - i.e. highest bid
      listing.offers.sort(function (a, b) {
        return (b.bidPrice - a.bidPrice);
      });

      //get a reference to our highest offer - this object includes the bid price as one of its fields
      highestOffer = listing.offers[0];
      console.info('highest Offer: ' + highestOffer);

      //bid must be higher than reserve price, otherwise we can not sell the car
      if (highestOffer.bidPrice >= listing.reservePrice) {
        let buyer = highestOffer.member;

        console.info('highestOffer.member: ' + buyer);

        //get the buyer i.e. the highest bidder on the vehicle
        let buyerAsBytes = await stub.getState(buyer);
        if (!buyerAsBytes || buyerAsBytes.toString().length <= 0) {
          throw new Error('vehicle does not exist: ');
        }

        //save a reference of the buyer for later - need this reference to update account balance
        buyer = JSON.parse(buyerAsBytes);
        console.info('buyer: ');
        console.info(util.inspect(buyer, { showHidden: false, depth: null }));

        //get reference to vehicle so we can get the owner i.e. the seller 
        let vehicleAsBytes = await stub.getState(listing.vehicle); 
        if (!vehicleAsBytes || vehicleAsBytes.toString().length <= 0) {
          throw new Error('vehicle does not exist: ');
        }

        //now that we have the reference to the vehicle object, 
        //we can find the owner of the vehicle bc the vehicle object has a field for owner
        var vehicle = JSON.parse(vehicleAsBytes);
        
        //get reference to the owner of the vehicle i.e. the seller
        let sellerAsBytes = await stub.getState(vehicle.owner); 
        if (!sellerAsBytes || sellerAsBytes.toString().length <= 0) {
          throw new Error('vehicle does not exist: ');
        }

        //the seller is the current vehicle owner
        let seller = JSON.parse(sellerAsBytes);

        console.info('seller: ');
        console.info(util.inspect(seller, { showHidden: false, depth: null }));

        console.info('#### seller balance before: ' + seller.balance);
        
        //ensure all strings get converted to ints
        let sellerBalance = parseInt(seller.balance, 10);
        let highOfferBidPrice = parseInt(highestOffer.bidPrice, 10);
        let buyerBalance = parseInt(buyer.balance, 10);

        //increase balance of seller
        sellerBalance += highOfferBidPrice;
        seller.balance = sellerBalance;

        console.info('#### seller balance after: ' + seller.balance);
        console.info('#### buyer balance before: ' + buyerBalance);
        
        //decrease balance of buyer by the amount of the bid price
        buyerBalance -= highestOffer.bidPrice;
        buyer.balance = buyerBalance;
        
        console.info('#### buyer balance after: ' + buyerBalance);
        console.info('#### buyer balance after: ' + buyerBalance);
        console.info('#### vehicle owner before: ' + vehicle.owner);
        
        //need reference to old owner so we can update their balance later
        let oldOwner = vehicle.owner;
        
        //assign person with highest bid as new owner
        vehicle.owner = highestOffer.member;
        
        console.info('#### vehicle owner after: ' + vehicle.owner);
        console.info('#### buyer balance after: ' + buyerBalance);
        listing.offers = null;
        listing.listingState = 'SOLD';

        //update the balance of the buyer 
        await ctx.stub.putState(highestOffer.member, Buffer.from(JSON.stringify(buyer)));
        
        console.info('old owner: ');
        console.info(util.inspect(oldOwner, { showHidden: false, depth: null }));
        
        //update the balance of the seller i.e. old owner
        await ctx.stub.putState(oldOwner, Buffer.from(JSON.stringify(seller)));
        
        //update the listing, use listingId as key, and the listing object as the value
        await ctx.stub.putState(listingKey, Buffer.from(JSON.stringify(listing)));        
      }
    }
    console.info('inspecting vehicle: ');
    console.info(util.inspect(vehicle, { showHidden: false, depth: null }));

    if (highestOffer) {
      //update the owner of the vehicle
      await ctx.stub.putState(listing.vehicle, Buffer.from(JSON.stringify(vehicle)));
    } else { throw new Error('offers do not exist: '); }

    console.info('============= END : closeBidding ===========');
  }
};

