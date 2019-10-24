
var com = require("../common/common");
var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        antPrefeb:{
            default:null,
            type:cc.Prefab,
        },
        monsterPrefeb:{
            default:null,
            type:cc.Prefab,
        },
        sourcePrefeb:{
            default:null,
            type:cc.Prefab,
        },
        targetPrefeb:{
            default:null,
            type:cc.Prefab,
        },
        ants:{
            default:[],
            type:cc.Node,
        },
        source:{
            default:null,
            type:cc.Node,
        },
        target:{
            default:null,
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
        },
        total_attact:{
            default:0,
            type:cc.Integer,
        },
        total_blood:{
            default:0,
            type:cc.Integer,
        },
        counts:{
            default:0,
            type:cc.Integer,
        }
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.topRight = cc.v2(this.node.width/2,this.node.height/2);
        this.bottomLeft = cc.v2(-this.node.width/2,-this.node.height/2);
        this.schedule(this.callBacKMonster,20, cc.macro.REPEAT_FOREVER);

        cc.game.on(store.defenSceneId+store.update,this.updateAnt,this);
        cc.game.on("insert_defen_ant",this.insertAnt,this);
    },

    insertAnt(){
        var index = store.getDefenAntIds().length;
        if(isNaN(index)||index == 0){
            var antId = 0;
        }else{
            var antId = store.defenAntIds[index-1]+1;
        }
        let t = cc.instantiate(this.antPrefeb);
            t.getComponent("defenant").id = antId;
            t.getComponent("defenant").needtime =com.TransToNeedTime(50);
            t.getComponent("defenant").attact = 50;
            t.getComponent("defenant").blood = 1000;
            t.parent = this.node;
            t.setPosition(0,0);
            this.ants.push(t);

            this.total_attact += 50;
            this.total_blood += 1000;

        store.putAntProperty(store.defenSceneId,antId,50,0,1000,50,0);
        store.putDefenAntIds(antId);
    },

    updateAnt(msg){
        for (var ant of this.ants) {
            if (ant.isValid){
                if (ant.getComponent("defenant").id == msg.id) {
                    ant.getComponent("defenant").updateAnt(msg.speed,msg.attact,msg.blood);
                    store.updateAntProperty(store.defenSceneId,msg.id,msg);
                    return;
                }
            }
        }
    },

    start () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this.target = cc.instantiate(this.targetPrefeb);
        this.target.parent = this.node;
        this.target.setPosition(0,-this.topRight.y);
        this.initScene();
    },

    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3*2,this.topRight.x/3*2);
        let y = this.random(this.bottomLeft.y/3*2,this.topRight.y/3*2);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },


    initScene() {
        for (var antId of store.defenAntIds)
        {
            var ant = store.getAntProperty(store.defenSceneId,antId);
            let t = cc.instantiate(this.antPrefeb);
            t.getComponent("defenant").id = antId;
            t.getComponent("defenant").needtime =com.TransToNeedTime(ant.speed);
            t.getComponent("defenant").attact = ant.attact;
            t.getComponent("defenant").blood = ant.blood;
            t.parent = this.node;
            t.setPosition(0,0);
            this.ants.push(t);

            this.total_attact += ant.attact;
            this.total_blood += ant.blood;
        }
    },

    addMonster(sourceX,sourceY,needtime,attact,blood){
        let monster = cc.instantiate(this.monsterPrefeb);
        monster.getComponent("defenmonster").initParams(needtime,blood,attact,this.target.getPosition());
        monster.parent = this.node;
        monster.setPosition(sourceX,sourceY);
        for(let i=0;i<this.ants.length;i++){
            if (this.ants[i].isValid){
                this.ants[i].getComponent("defenant").insertNode(monster);    
            }
        }
    },

    callBacKMonster(){

        if(this.counts > 0) {
            this.counts --;
            return;
        }

        let eggsCount = store.getEggs();
        let antsCount = store.getDefenAntIds().length;
        
        if(antsCount < 1 && eggsCount <= 3) {
            return;
         }else if(antsCount < 1 && eggsCount > 3) {
           this.counts = 3;
           this.createMonster(0);
           return;
        }else if (eggsCount > 10 && antsCount > 1){
            this.createMonster(1);
        }else if (eggsCount > 1 && eggsCount < 10 && antsCount < 3 && antsCount > 0){
            this.createMonster(-1);
        }else if (antsCount > 5){
            this.createMonster(-1);
        }else {
            this.createMonster(0);
        }
        
    },

    createMonster(level){
        var moveTime = this.random(5,10);
        if(level == 1){
            var blood = this.random(this.total_attact*moveTime/2,this.total_attact*moveTime*1.5);
            var attact = this.random(this.total_blood/40,this.total_blood/10);   
        }else if(level == 0){
            var blood = this.random(this.total_attact*moveTime/2,this.total_attact*moveTime*1.1);
            var attact = this.random(this.total_blood/40,this.total_blood/10); 
        }else if(level == -1){
            var blood = this.random(this.total_attact*moveTime/2,this.total_attact*moveTime*1);
            var attact = this.random(this.total_blood/50,this.total_blood/30);    
        }
        this.addMonster(0,this.topRight.y-100,moveTime,attact,blood);
    }

});
