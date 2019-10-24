var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        speedTimeLabel:{
            default:null,
            type:cc.Label,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.schedule(this.callbackTime,1, cc.macro.REPEAT_FOREVER);
    },

    prefixZero(num, n) {
        return (Array(n).join(0) + num).slice(-n);
    },

    callbackTime(){
        var remind =parseInt((store.totalTime - (Date.parse(new Date())-store.getSpeedTime()))/1000); 
        var houre = parseInt(remind / 3600);
        var minit = parseInt((remind - houre*3600)/60);
        var second = parseInt(remind - houre*3600 - minit*60);
        this.speedTimeLabel.string = this.prefixZero(houre,2).toString() + ":" + this.prefixZero(minit,2).toString() +":" + this.prefixZero(second,2).toString();
    },

    start () {
        this.callbackTime();
    },

    onClose(){
        this.node.destroy();
    }

    // update (dt) {},
});
