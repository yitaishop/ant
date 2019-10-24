
var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        birthBar:{
            default:null,
            type:cc.ProgressBar,
        },
        totalTime:{
            default:0,
            type:cc.Integer,
        },
        speedTime:{
            default:0,
            type:cc.Integer,
        },
        queenBirthPrefeb:{
            default:null,
            type:cc.Prefab,
        }
    },

    onLoad () {
        this.totalTime = store.totalTime;
        this.speedTime = store.getSpeedTime();
        this.schedule(this.setBar,10, cc.macro.REPEAT_FOREVER);
        cc.game.on("queen_birth",this.updateTime,this);
        this.setBar();
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
    },

    touchStart(){
        var queenBirth = cc.instantiate(this.queenBirthPrefeb);
        queenBirth.parent = this.node.parent;
    },

    setBar(){
        this.birthBar.progress = (Date.parse(new Date()) - this.speedTime)/this.totalTime;
        if(this.birthBar.progress >= 1){
            cc.game.emit("insert_egg");
            store.putSpeedTime();
            this.speedTime = store.getSpeedTime();
            this.birthBar.progress = (Date.parse(new Date()) - this.speedTime)/this.totalTime;
        }
    },

    updateTime(tm){
        this.speedTime -= tm;
        store.updateSpeedTime(this.speedTime);
        this.setBar();
    },

    start () {
    },

    // update (dt) {},
});
