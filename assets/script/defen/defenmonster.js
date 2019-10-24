// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
       blood:{
           default:0,
           type:cc.Integer,
       },
       total_blood:{
        default:0,
        type:cc.Integer,
       },
       attact:{
           default:0,
           type:cc.Integer,
       },
       total_attact:{
        default:0,
        type:cc.Integer,
       },
       needtime:{
           default:2,
           type:cc.Float,
       },
       speed:{
           default:0,
           type:cc.Integer,
       },
       target:{
           default:new cc.Vec2,
       },
       topRight:{
           default:new cc.v2,
       },
       bottomLeft:{
           default:new cc.v2,
       },
       bloodBar:{
           default:null,
           type:cc.ProgressBar,
       },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.topRight = cc.v2(this.node.parent.width/2,this.node.parent.height/2);
        this.bottomLeft = cc.v2(-this.node.parent.width/2,-this.node.parent.height/2);
    },

    initParams(needtime,blood,attact,target){
        this.needtime = needtime;
        this.blood = blood;
        this.attact = attact;
        this.target = target;
        this.total_blood = blood;
    },

    start () {
        this.speed = this.topRight.x/this.needtime;
    },

    moveTo(dt,from,to){
        let dir = to.sub(from);
        if (dir.mag() < 5){
            return
        }
        dir.normalizeSelf();
        this.node.x += dt*dir.x*this.speed;
        this.node.y += dt*dir.y*this.speed;
    },

    setBar(attact){
        this.total_attact += attact;
        this.bloodBar.progress = (this.total_blood - this.total_attact)/this.total_blood;
    },

    checkAttact(other,self){
        var attact = other.node.getComponent("defenant").attact;
        this.setBar(attact);
        this.blood -= attact;
        if (this.blood <= 0) {
            var golds =parseInt(this.random(10,50)*this.total_blood/1000*this.node.parent.getComponent("scenceDefen").ants.length);
            cc.game.emit("updateGolds",golds);
            cc.game.emit("tips","兵蚁消灭入侵者，获得"+golds+"蚁币");
            this.node.destroy();
        }
    },

    onCollisionEnter:function (other, self) {
        switch (other.node.name) {
            case "defenAnt":
                this.checkAttact(other,self);
                break;
            case "defenTarget":
                this.arrivedTarget();
                break;
        }
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    arrivedTarget(){
        this.node.destroy();
        if (store.getEggs() > 0) {
            cc.game.emit("updateEggs",-1);
            cc.game.emit("tips","入侵者进入蚁穴,损失蚁卵一枚");
        }else{
            var lost = this.random(0,20);
            cc.game.emit("updateGolds",-lost);
            cc.game.emit("tips","入侵者进入蚁穴,损失蚁币"+lost.toString());
        }
        //TODO 显示egg减少提示
    },

    update (dt) {
        this.moveTo(dt,this.node.getPosition(),this.target);
    },
});
