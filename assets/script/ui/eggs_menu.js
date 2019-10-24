var store = require("../store/store");

cc.Class({
    extends: cc.Component,

   
    properties: {
        eggslb:{
            default:null,
            type:cc.Label,
        },
        hatch:{
            default:null,
            type:cc.Prefab,
        },
        showMsgPrefeb:{
            default:null,
            type:cc.Prefab,
        }
     },
 
     // LIFE-CYCLE CALLBACKS:
 
     onLoad () {
         cc.game.on("updateEggs",this.updateEggs,this);
         this.node.on(cc.Node.EventType.TOUCH_START,this.callBackTouch, this);
     },
 
     updateEggs(count){
         store.updateEggs(count);
         this.eggslb.string = store.getEggs();
     },

     callBackTouch(){
        var showMsg = cc.instantiate(this.showMsgPrefeb);
        showMsg.getComponent("showmsg").title = "ant_eggs";
        showMsg.parent = this.node.parent.parent;
    },
 
     start () {
         this.eggslb.string = store.getEggs();
     },
});
