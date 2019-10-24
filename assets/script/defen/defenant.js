var com = require("../common/common");
var store = require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
        id:{
            default:0,
            type:cc.Integer,
        },
       attact:{
           default:0,
           type:cc.Float,
       },
       blood:{
           default:0,
           type:cc.Float,
       },
       nodes:{
           default:[],
       },
       currNode:{
           default:null,
           type:cc.Node,
       },
       status:{
           default:0,
           type:cc.Integer,
       },
       target:{
        default:new cc.Vec2,
       },
       needtime: {
           default:0,
           type:cc.Float,
       },
       action:{
        default:null,
        type:cc.Action,
       },
        topRight:{
            default:new cc.v2,
       },
        bottomLeft:{
            default:new cc.v2,
       },
        movespeed:{
            default:0,
            type:cc.Float,
        },
        _movespeed:{
            default:0,
            type:cc.Float,
        },
        propPrefeb:{
            default:null,
            type:cc.Prefab,
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

        this.schedule(this.callBacKeeper,1, cc.macro.REPEAT_FOREVER);
        this.node.on(cc.Node.EventType.TOUCH_START,this.callBackTouch, this);

        this.setBar();
    },

    start () {
        this._movespeed = this.topRight.y/this.needtime*2;
    },

    callBackTouch(){
        var prop = cc.instantiate(this.propPrefeb);
        prop.getComponent("ant_pro").insert({ "antname":"兵蚁","antid":this.id, "sceneid":store.defenSceneId,"ants":[{"title":"蚁速","value":com.TransToSpeed(this.needtime),cost:com.TransToCost(com.TransToSpeed(this.needtime)*10)},{"title":"蚁攻","value":this.attact,cost:this.attact*10},{"title":"血量","value":this.blood,cost:100}]});
        prop.zIndex = cc.macro.MAX_ZINDEX;
        prop.parent = this.node.parent;
        prop.setPosition(0,0);
     },

    callBacKeeper(){
            var node = this.getNode();
            if (node != null){
                this.currNode = node;
                this.target = node.getPosition();
                this.turnRound(1,this.target);
                this.movespeed = this._movespeed;
            }else{
                this.target = this.getRandomPos();
                this.movespeed = this._movespeed*0.3;
                this.turnRound(1,this.target);
            }
            this.status = 0;      
    },

    setBar(){
        this.bloodBar.progress = this.blood/1000; 
    },

    updateAnt(speed,attact,blood){
        if(speed > 0){
            this.needtime = com.TransToNeedTime(speed);
            this._movespeed =  this.topRight.y/this.needtime*2;
        }
        if(attact > 0){
            this.attact = attact;
        }
        if(blood > 0){
            this.blood = blood;
            this.setBar();
        }
    },

    insertNode(v){
        this.nodes.push(v);
    },

    getNode() {
        if (this.nodes.length>0){
            let node = this.nodes[0];
            if (!node.isValid){
                this.removeNode();
                return null
            }
            return node;
        }
        return null;
    },

    removeNode(){
        this.nodes.splice(0,1);
    },

    randomRatation() {
        let angle = this.random(-15,15);
        this.node.rotation=angle;
        this.action = cc.rotateBy(2,angle);
        this.node.runAction(this.action);
    },

    moveTo(dt,from,to){
        let dir = to.sub(from);
        if (dir.mag() < dt*this.movespeed){
            return
        }
        dir.normalizeSelf();
        this.node.x += dt*dir.x*this.movespeed;
        this.node.y += dt*dir.y*this.movespeed;
    },

    onCollisionEnter:function (other, self) {
        switch (other.node.name ){
            case "defenMonster":
            if (this.currNode == other.node){
                this.status = 1;
                this.blood -= (other.getComponent("defenmonster").attact/self.node.getParent().getComponent("scenceDefen").ants.length/10);
                store.updateAntProperty(store.defenSceneId,this.id,{"blood":this.blood});
                this.setBar();
                
                if (this.blood <= 0) {
                    cc.game.emit("tips","有兵蚁失血过多牺牲！");
                    this.node.destroy();
                    store.removeDefenAntIds(this.id);
                }else if (this.blood <= 150){
                    cc.game.emit("tips","有兵蚁血量过低！急需回血！");
                }
            }
                //play attact animation
                
        }
    },

    onCollisionStay:function (other, self) {
        switch (other.node.name ){
            case "defenMonster":
            if (this.currNode == other.node){
                this.status = 1;
            }
        }
    },

    onCollisionExit: function (other, self) {
        switch (other.node.name){
            case "defenMonster":
                if (this.currNode == other.node){
                    this.status = 0;
                }
                
        }
    },

    turnRound(tm,targe) {
        let position = this.node.getPosition();
        let ran = Math.atan2(targe.y-position.y,targe.x-position.x);
        let angle = 90-(ran*180/(Math.PI));
        this.node.runAction(cc.rotateTo(tm,angle));
    },

    getRandomPos() {
        let x = this.random(this.bottomLeft.x/3*2,this.topRight.x/3*2);
        let y = this.random(this.bottomLeft.y/3*2,this.topRight.y/3*2);
        return cc.v2(x,y)
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },


    update (dt) {
        if (this.status == 0) {
            this.moveTo(dt,this.node.getPosition(),this.target);   
        }  
    },
});
