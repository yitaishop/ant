var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
       goldslb:{
           default:null,
           type:cc.Label,
       }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.on("updateGolds",this.updateGolds,this);
    },

    updateGolds(golds){
        store.updateGolds(golds);
        this.goldslb.string = store.getGolds();
    },

    start () {
        this.goldslb.string = store.getGolds();
    },

    // update (dt) {},
});
