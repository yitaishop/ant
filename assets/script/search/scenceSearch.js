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
        antPrefeb:{
            default: null,
            type: cc.Prefab,
          },
        golds:{
            default:null,
            type:cc.Node,
        },
        ants: {
            default: [],
            type: cc.Node,
          },
        factory:{
            default:null,
            type:cc.Node,
          },
        goods:{
            default:null,
            type:cc.Prefab,
        },
        count: {
            default:0,
            type:cc.Integer,
        },
        touchCount:{
            default:4,
            type:cc.Integer,
        },
        touchStartPos:{
            default:new cc.v2,
        },
        topRight:{
            default:new cc.v2,
        },
        bottomLeft:{
            default:new cc.v2,
        },
        touchHigh:{
            default:8,
        },
        touchLow:{
            default:4,
        },
        foodHigh:{
            default:9,
        },
        foodLow:{
            default:1,
        },
        bars:{
            default:null,
            type:cc.ProgressBar,
        },
        total:{
            default:1,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () { 
      this.touchCount = 1;
      this.total = 1;
      this.topRight = cc.v2(this.node.width/2,this.node.height/2);
      this.bottomLeft = cc.v2(-this.node.width/2,-this.node.height/2);
      this.foodLow = 1;
     
      cc.game.on(store.searchSceneId+store.update,this.updateAnt,this);
      cc.game.on("insert_search_ant",this.insertAnt,this);
    },

    insertAnt(){
        var antId =  store.getSearchAntIds().length;
        let t = cc.instantiate(this.antPrefeb);
        t.getComponent("searchant").needtime =com.TransToNeedTime(50);
        t.getComponent("searchant").id = antId;
        t.getComponent("searchant").power = 50;
        t.parent = this.node;
        t.setPosition(0,0);
        this.ants.push(t);

        store.putAntProperty(store.searchSceneId,antId,50,50,0,0,0);
        store.putSearchAntIds(antId);
    },

    initScene(){
        this.touchHigh = store.touch_high;
        this.touchLow = store.touch_low;
        for (var antId of store.getSearchAntIds())
        {
            var ant = store.getAntProperty(store.searchSceneId,antId);
            let t = cc.instantiate(this.antPrefeb);
            t.getComponent("searchant").needtime =com.TransToNeedTime(ant.speed);
            t.getComponent("searchant").id = antId;
            t.getComponent("searchant").power = ant.power;
            t.parent = this.node;
            t.setPosition(0,0);
            this.ants.push(t);
            if (ant.power > this.foodHigh){
                this.foodHigh = ant.power;
            }
        }
    },

    updateAnt(msg) {
        for (var ant of this.ants) {
            if (ant.getComponent("searchant").id == msg.id) {
                if (msg.power > 0) {
                    if (msg.power > this.foodHigh) {
                        this.foodHigh = msg.power;
                    }
                }
                ant.getComponent("searchant").updateAnt(msg.speed,msg.power);
                store.updateAntProperty(store.searchSceneId,msg.id,msg);
                return;
            }
        }
    },

    insertGood(){
        this.setBar(this.touchCount);
        if (this.touchCount <=0 ){
            let good = cc.instantiate(this.goods);
            good.getComponent("searchgoods").weight = this.random(this.foodLow,this.foodHigh);
            good.parent = this.node;
            good.setPosition(this.getRandomPos());
            this.addGoodToAnts(good);
            this.touchCount = this.random(this.touchLow,this.touchHigh);
            this.total = this.touchCount;
            return
        }
        this.touchCount--;
    },

    setBar(count){
        this.bars.progress = (this.total - count)/this.total;
    },

    addGoodToAnts(good){
        var index = 0;
        var min = 1000;
        for(let i=0;i<this.ants.length;i++){
            var ant = this.ants[i].getComponent("searchant");
            var length = ant.goodsList.length;
            if(length == 0) {
                ant.insertList(good);
                return;
            }else{
                if (length < min) {
                    min = length;
                    index = i;
                }
            }
        }
        this.ants[index].getComponent("searchant").insertList(good);
    },

    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3*2,this.topRight.x/3*2);
        let y = this.random(0,this.topRight.y/4*3);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    start () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.initScene(); 
    },
});
