var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        hatch:{
            default:null,
            type:cc.Prefab,
        },
    },


    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START,this.callBackTouch, this);
    },

    start () {
    },

    callBackTouch(){
        var hatch = cc.instantiate(this.hatch);
        hatch.getComponent("room_main").eggs_count = store.getEggs();
        hatch.parent = this.node.parent;
        hatch.zIndex = cc.macro.MAX_ZINDEX;
        hatch.setPosition(0,0);
    },

    onCollisionEnter: function (other, self) {
        this.checkCollistion(other,self);
    },

    checkCollistion:function(other,self){
        switch (other.node.name ){
            case "nurse":
                cc.game.emit("updateEggs",1);
                break;
        }
    },

});
