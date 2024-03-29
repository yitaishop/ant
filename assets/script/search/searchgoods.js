// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        isCarried:{
            default:false,
        },
        weight:{
            default:0.6,
            type:cc.Float,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {
        this.schedule(this.callBacKeeper,10, cc.macro.REPEAT_FOREVER);
    },

    callBacKeeper(){
        if(!this.isCarried){
            this.unschedule(this.callBacKeeper);
            this.node.destroy();
        }
    },

    // update (dt) {},
});
