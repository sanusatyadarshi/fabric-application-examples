
'use strict';

module.exports = class Commodity {

    constructor(obj){
        Object.assign(this,obj);
    }

    getTradeId(){
        return this.tradeId;
    }

    getTradingSymbol(){
        return this.tradingSymbol;
    }

    getDescription(){
        return this.description;
    }

    getQuantity(){
        return this.quantity;
    }

    getOwner(){
        return this.owner;
    }

}
