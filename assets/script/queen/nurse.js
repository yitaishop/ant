// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var com = require("../common/common");
var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        id:{
            default:0,
        },
        nodes:{
            default:[],
            type: cc.Node,
        },
        status:{
            default:0,      // 0:等待中  1:发现egg  2:得到egg 3：放下egg返回等待区
        },
        room:{
            default:new cc.Vec2,
        },
        queen:{
            default:new cc.Vec2,
        },
        factory:{
            default:new cc.Vec2,
        },
        target:{
            default:new cc.Vec2,
        },
        currNode:{
            default:null,
            type:cc.Node,
        },
        needtime:{
            default:2,
            type:cc.Float,
        },
        hardwork:{
            default:0,
        },
        movespeed:{
            default:1,
            type:cc.Float,
        },
        action:{
            default:null,
            type:cc.Action,
        },
        foodPrefeb:{
            default:null,
            type:cc.Prefab,
        },
        topRight:{
            default:new cc.v2,
        },
        bottomLeft:{
            default:new cc.v2,
        },
        propPrefeb:{
            default:null,
            type:cc.Prefab,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.topRight = cc.v2(this.node.parent.width/2,this.node.parent.height/2);
        this.bottomLeft = cc.v2(-this.node.parent.width/2,-this.node.parent.height/2);

        this.schedule(this.callBacKeeper,2, cc.macro.REPEAT_FOREVER);
        this.node.on(cc.Node.EventType.TOUCH_START,this.callBackTouch, this);
    },

    callBacKeeper(){
        if (this.status == 0 || this.status == 3) {
            var node = this.getNode();
            if (node != null){
               this.cheekNode(node);
            }else{
                if (this.status == 0 ){
                    this.randomRatation();
                }
            }    
        }
    },

    callBackTouch(){
        var prop = cc.instantiate(this.propPrefeb);
        prop.getComponent("ant_pro").insert({ "antname":"雄蚁","antid":this.id, "sceneid":store.queenSceneId,"ants":[{"title":"蚁速","value":com.TransToSpeed(this.needtime),cost:com.TransToCost(com.TransToSpeed(this.needtime))*10}]});
        prop.parent = this.node.parent;
        prop.zIndex = cc.macro.MAX_ZINDEX;
        prop.setPosition(0,0);
     },

    updateAnt(speed,hardwork){
        if(speed > 0){
            this.needtime = com.TransToNeedTime(speed);
            this.movespeed =  this.topRight.y/this.needtime*2;
        }
        if(hardwork > 0){
            this.hardwork = hardwork;
        }
    },

    cheekNode(node){
        this.node.stopAction(this.action);
        switch (node.name){
            case "egg":
                    this.currNode = node;
                    this.target = node.getPosition();
                    this.turnRound(1,this.target);
                    this.status = 1;
                    break;
             case "good":
                    this.currNode = node;
                    this.target = this.factory;
                    this.turnRound(1,this.target);
                    this.status = 1;
                    break;
        }
    },

    moveTo(dt,from,to){
        let dir = to.sub(from);
        if (dir.mag() < 5){
            if (this.status == 3) {
                this.status = 0;
            }
            return
        }
        dir.normalizeSelf();
        this.node.x += dt*dir.x*this.movespeed;
        this.node.y += dt*dir.y*this.movespeed;
    },

    turnRound(tm,targe) {
        let position = this.node.getPosition();
        let ran = Math.atan2(targe.y-position.y,targe.x-position.x);
        let angle = 90-(ran*180/(Math.PI));
        this.node.runAction(cc.rotateTo(tm,angle));
    },

    insertNode(v){
        this.nodes.push(v);
    },

    getNode() {
        if (this.nodes.length>0){
            return this.nodes[0];
        }
        return null;
    },

    randomRatation() {
        let angle = this.random(-15,15);
        this.node.angle = angle;
        this.action = cc.rotateBy(2,angle);
        this.node.runAction(this.action);
    },

    removeNode(){
        this.nodes.splice(0,1);
    },

    onCollisionEnter: function (other, self) {
        this.checkCollistion(other,self);
    },

    onCollisionStay:function (other, self) {
        this.checkCollistion(other,self);
    },

    checkCollistion:function(other,self){
        switch (other.node.name ){
            case "queen":
                let fdd = this.node.getChildByName("food");
                if (fdd != null){
                    fdd.removeFromParent();
                    fdd.destroy();
                    this.removeNode(); 
                    this.node.removeAllChildren();
                }
                this.target = this.getRandomPos();
                this.turnRound(1,this.target);
                this.status = 3;
                break;
            case "factory":
                let fd = cc.instantiate(this.foodPrefeb);
                fd.setParent(this.node);
                fd.setPosition(cc.v2(0,94));
                this.target = this.queen;
                this.turnRound(1,this.target);
                this.status = 1;
                break;
            case "egg":
                if (this.status == 1 && this.currNode == other.node) {
                    this.target = this.room;
                    this.turnRound(1,this.target);
                    this.status = 2;
                    if (other.node.isValid){
                        other.node.setParent(this.node); 
                        other.node.setPosition(cc.v2(0,94));
                    }  
                }
                break;
            case "room":
                if (this.status == 2){
                    let egg = this.node.getChildByName("egg");
                    if (egg != null){
                        egg.destroy();
                        this.removeNode(); 
                    }
                    this.target = this.getRandomPos();
                    this.turnRound(1,this.target);
                    this.status = 3;
                }
                break;
        }
    },

    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3,this.topRight.x/3);
        let y = this.random(this.bottomLeft.y/3,this.topRight.y/3);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    start () {
        this.movespeed = this.topRight.y/this.needtime*2;
    },

    update (dt) {
        if (this.status != 0) {
            this.moveTo(dt,this.node.getPosition(),this.target);
        }    
    },
});
