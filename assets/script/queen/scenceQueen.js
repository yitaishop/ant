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
var com = require("../common/common");

cc.Class({
    extends: cc.Component,

    properties: {
      nursePrefeb:{
          default:null,
          type:cc.Prefab,
      },
      eggPrefeb:{
          default:null,
          type:cc.Prefab,
      },
      room :{
          default:null,
          type:cc.Node,
      },
      queen :{
        default:null,
        type:cc.Node,
      },
      factory :{
        default:null,
        type:cc.Node,
      },
      ants:{
        default:[],
        type:cc.Node,
      },
      touchStartPos:{
        default:new cc.v2,
      },
      topRight:{
        default:new cc.v2,
      },
      bottomLeft:{
        default:new cc.v2,
      }
    },

    onLoad () {
        this.topRight = cc.v2(this.node.width/2,this.node.height/2);
        this.bottomLeft = cc.v2(-this.node.width/2,-this.node.height/2);

        cc.game.on(store.queenSceneId+store.update,this.updateAnt,this);
        cc.game.on("insert_queen_ant",this.insertAnt,this);
        cc.game.on("insert_egg",this.insertEgg,this);
    },

    insertAnt(){
        var antId = store.getQueenAntIds().length;
        let t = cc.instantiate(this.nursePrefeb);
        t.getComponent("nurse").id = antId;
        t.getComponent("nurse").needtime =com.TransToNeedTime(50);
        t.getComponent("nurse").hardwork =50;
        t.getComponent("nurse").queen = this.queen.getPosition();
        t.getComponent("nurse").room  = this.room.getPosition();
        t.getComponent("nurse").factory = this.factory.getPosition();
        t.parent = this.node;
        t.setPosition(this.getRandomPos());
        this.ants.push(t);

        store.putAntProperty(store.queenSceneId,antId,50,0,0,0,50);
        store.putQueenAntIds(antId);
    },

    updateAnt(msg){
        for (var ant of this.ants) {
            if (ant.isValid){
                if (ant.getComponent("nurse").id == msg.id) {
                    ant.getComponent("nurse").updateAnt(msg.speed,msg.hardwork);
                    store.updateAntProperty(store.queenSceneId,msg.id,msg);
                    return;
                }
            }
        }
    },

    initScene(){
        for (var antId of store.queenAntIds)
        {
            var ant = store.getAntProperty(store.queenSceneId,antId);
            let t = cc.instantiate(this.nursePrefeb);
            t.getComponent("nurse").id = ant.id;
            t.getComponent("nurse").needtime =com.TransToNeedTime(ant.speed);
            t.getComponent("nurse").hardwork = ant.hardwork;
            t.getComponent("nurse").queen = this.queen.getPosition();
            t.getComponent("nurse").room  = this.room.getPosition();
            t.getComponent("nurse").factory = this.factory.getPosition();
            t.parent = this.node;
            t.setPosition(this.getRandomPos());
            this.ants.push(t);
        }
    },

    insertEgg(){
        let egg = cc.instantiate(this.eggPrefeb);
        egg.parent = this.node;
        egg.setPosition(this.queen.getPosition().x + this.random(-100,100),this.queen.getPosition().y + this.random(100,200));
    },

    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3*2,this.topRight.x/3*2);
        let y = this.random(this.bottomLeft.y/3*2,this.topRight.y/3*2);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    addNodeToNurse(node){
        var index = 0;
        var min = 1000;
        for(let i=0;i<this.ants.length;i++){
            var nurse = this.ants[i].getComponent("nurse");
            var length = nurse.nodes.length;
            if(length == 0) {
                nurse.insertNode(node);
                return;
            }else{
                if (length < min) {
                    min = length;
                    index = i;
                }
            }
        }
        this.ants[index].getComponent("nurse").insertNode(node);
    },

    start () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.initScene();
    },

});
