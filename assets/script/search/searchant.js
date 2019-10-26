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
        movespeed:{
            default:100,
            type:cc.Float,
        },
        _movespeed:{
            default:100,
            type:cc.Float,
        },
        propPrefeb:{
            default:null,
            type:cc.Prefab,
        },
        needtime:{
            default:0,
            type:cc.Float,
        },
        status:{
            default:0,
            type:cc.Integer,
        },
        target:{
            default:new cc.Vec2,
        },
        randpos:{
            default:new cc.Vec2,
        },
        isCarring:{
            default:false,
        },
        goodsList:{
            default:[],
        },
        isPause:{
            default:false,
        },
        currNode:{
            default:null,
            type:cc.Node,
        },
        topRight:{
            default:new cc.v2,
        },
        bottomLeft:{
            default:new cc.v2,
        },
        id:{
            default:0,
        },
        power:{
            default:0,
        }
    },

    checkCollistion:function(other,self){
        switch (other.node.name ){
            case "goods":
                if (!this.isCarring && this.currNode == other.node) {
                    this.isCarring = true;
                    other.node.getComponent("searchgoods").isCarried = true;
                    other.node.setParent(this.node); 
                    other.node.setPosition(cc.v2(0,94));
                    let ratio = other.node.getComponent("searchgoods").weight/this.power;
                    this.movespeed *= (1-4*(ratio>1?1:ratio)/5);
                    this.onMoveTo(this.node.getParent().getChildByName("factory").position);
                }
                break;
            case "factory":
                let goods = this.node.getChildByName("goods")
                if (goods != null){
                    goods.destroy();
                    this.movespeed = this._movespeed;
                    this.isCarring = false;
                    this.removeElement();
                    this.isPause = false;
                    cc.game.emit("updateGolds",goods.getComponent("searchgoods").weight);
                }
                break;
            case "bomb":
                if (!this.isCarring && this.currNode == other.node) {
                    this.isCarring = true;
                    other.node.destroy();
                    this.movespeed = 0;
                    this.scheduleOnce(function(){
                        this.movespeed = this._movespeed;
                        this.isCarring = false;
                        this.removeElement();
                        this.isPause = false;
                    }, 3);
                }
                break;
        }
    },

    updateAnt(speed,power){
        if(speed > 0){
            this.needtime = com.TransToNeedTime(speed);
            this._movespeed =  this.topRight.y/this.needtime*2;
        }
        if(power > 0){
            this.power = power;
        }
    },

    onCollisionEnter: function (other, self) {
        this.checkCollistion(other,self);
    },

    onCollisionStay: function (other, self) {
        this.checkCollistion(other,self);
    },

    onCollisionExit: function(other,self){
        this.checkCollistion(other,self);
    },

    insertList( v ){
        this.goodsList.push(v);
    },

    getList() {
        if (this.goodsList.length>0){
            let node = this.goodsList[0];
            if (!node.isValid){
                this.removeElement();
                return null
            }
            return this.goodsList[0];
        }
        return null;
    },

    removeElement(){
        this.goodsList.splice(0,1);
    },

    callBackScheduler(){
        if (!this.isCarring) {
            this.currNode = this.getList();
            if (this.currNode != null && this.currNode.isValid){
                this.isPause = true;
                this.onMoveTo(this.currNode.getPosition());
            }else{
                this.removeElement();
            }
        } 
    },

    onMoveTo(v2){
        this.status = 1;
        this.target = v2;
        this.turnRound(v2,0.5);
    },

    turnRound(targe,tm) {
        let position = this.node.getPosition();
        let ran = Math.atan2(targe.y-position.y,targe.x-position.x);
        let angle = 90-(ran*180/(Math.PI));
        this.node.runAction(cc.rotateTo(tm,angle));
    },

    callBacKeeper(){
        if (!this.isPause) {
            this.callBackScheduler();
        }
    },

    // LIFE-CYCLE CALLBACKS:
 
    onLoad () {
        this.topRight = cc.v2(this.node.parent.width/2,this.node.parent.height/2);
        this.bottomLeft = cc.v2(-this.node.parent.width/2,-this.node.parent.height/2);
        this.schedule(this.callBacKeeper,1, cc.macro.REPEAT_FOREVER);
        this.node.on(cc.Node.EventType.TOUCH_START,this.callBackTouch, this);
    },

    callBackTouch(){
       var prop = cc.instantiate(this.propPrefeb);
       prop.getComponent("ant_pro").insert({ "antname":"工蚁","sceneid": store.searchSceneId,"antid":this.id,"ants":[{"title":"蚁速","value":com.TransToSpeed(this.needtime),cost:com.TransToCost(com.TransToSpeed(this.needtime)*10)},{"title":"蚁力","value":this.power,cost:this.power*10}]});
       prop.zIndex = cc.macro.MAX_ZINDEX;
       prop.parent = this.node.parent;
       prop.setPosition(0,0);
    },


    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3*2,this.topRight.x/3*2);
        let y = this.random(0,this.topRight.y/3*2);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    runFromTo(dt,from,to,stopFlag){
        let dir = to.sub(from);
        if (dir.mag() < this.movespeed*dt){
            this.status = stopFlag;
            return
        }
        dir.normalizeSelf();
        this.node.x += dt*dir.x*this.movespeed;
        this.node.y += dt*dir.y*this.movespeed;
    },

    start () {
        this.movespeed = this.topRight.y/this.needtime*2;
        this._movespeed = this.movespeed;
    },

    // 0 : 没有任务
    // 1 : 有任务在跑
    // 2 ：随机运动中

    carryRunning(dt) {
        if (this.status == 1) {
            let dir = this.target.sub(this.node.getPosition());
            if (dir.mag() < this.movespeed*dt){
                this.status = 0;
                return
            }
            dir.normalizeSelf();
            this.node.x += dt*dir.x*this.movespeed;
            this.node.y += dt*dir.y*this.movespeed;
            return 
        }
    },

    randTurnRound(dt) {
        if (this.status == 0) {   
            this.randpos = this.getRandomPos();    
            if (this.status != 1) {
                this.turnRound(this.randpos,dt);
                this.status = 2;
            }
            return 
        }
    },

    randRunning(dt) {   
        if (this.status == 2) {
            let dir = this.randpos.sub(this.node.getPosition())
            if (dir.mag() < this.movespeed*dt){
                if (this.status != 1 ) {
                    this.status = 0;
                    this.isCarring = false;
                    this.isPause = false;
                    return
                }              
            }   
            dir.normalizeSelf();   
            this.node.x += dt*dir.x*(this.movespeed/5);
            this.node.y += dt*dir.y*(this.movespeed/5);
            return
        }
    },

    update (dt) {   
        this.carryRunning(dt);
        this.randTurnRound(dt);
        this.randRunning(dt);
    },
});
