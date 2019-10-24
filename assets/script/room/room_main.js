var store =  require("../store/store");

cc.Class({
    extends: cc.Component,

    properties: {
       eggs_count:0,
       egg_prefeb:{
           default:null,
           type : cc.Prefab,
       },
       tmpEgg:{
           default:null,
           type:cc.Node,
       },
       egg:{
           default:null,
           type:cc.Node,
       },
       eggs:{
            default:[],
            type:cc.Node,
       },
       egglabel:{
        default:null,
        type:cc.Label,
       },
       searchAnt:{
           default:null,
           type:cc.Node,
       },
       searchcount:{
        default:null,
        type:cc.Label,
       },
       searchcountN:{
           default:0,
       },
       defenAnt:{
           default:null,
           type:cc.Node,
       },
       defencount:{
        default:null,
        type:cc.Label,
       },
       defencountN:{
        default:0,
       },
       queenAnt:{
           default:null,
           type:cc.Node,
       },
       queencount:{
        default:null,
        type:cc.Label,
       },
       queencountN:{
        default:0,
       },
       status:{
           default:0,
       },
       target:{
           default:new cc.Vec2,
       },
       dialog:{
           default:null,
       },
       dlgPrefeb:{
        default:null,
        type:cc.Prefab,
       },
    },

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);  
        this.egg.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
    },

    touchMove(event){
        event.stopPropagation();
        if(this.tmpEgg != null && this.status == 0){
            if(this.judgeDistance(this.tmpEgg.getPosition(),this.searchAnt.getPosition())){
                this.searchcountN++;
                this.searchcount.string = this.searchcountN;
                this.tmpEgg.getComponent("room_egg").antype = "search";
                this.eggs.push(this.tmpEgg);
                return;
            }else if(this.judgeDistance(this.tmpEgg.getPosition(),this.defenAnt.getPosition())){
                this.defencountN++;
                this.defencount.string = this.defencountN;
                this.tmpEgg.getComponent("room_egg").antype = "defen";
                this.eggs.push(this.tmpEgg);
                return;
            }else if( this.judgeDistance(this.tmpEgg.getPosition(),this.queenAnt.getPosition())){
                this.queencountN++;
                this.queencount.string = this.queencountN;
                this.tmpEgg.getComponent("room_egg").antype = "queen";
                this.eggs.push(this.tmpEgg);
                return;
            }
            var pos = this.node.convertToNodeSpaceAR(cc.v2(event.getLocation().x,event.getLocation().y));
            this.tmpEgg.setPosition(pos.x/3,pos.y/3 - this.node.height/3 - (this.node.height - this.egg.y)/3);
        }
    },

    btnSearch(){
        for (var i=0;i<this.eggs.length;i++){
            if (this.eggs[i].getComponent("room_egg").antype == "search"){
                this.eggs[i].destroy();
                this.eggs.splice(i,1);
                this.searchcountN--;
                this.eggs_count++;
                break;
            }
        } 
        this.searchcount.string = this.searchcountN;
        this.egglabel.string = this.eggs_count;
    },

    btnDefen(){
        for (var i=0;i<this.eggs.length;i++){
            if (this.eggs[i].getComponent("room_egg").antype == "defen"){
                this.eggs[i].destroy();
                this.eggs.splice(i,1);
                this.defencountN--;
                this.eggs_count++;
                break;
            }
        } 
        this.defencount.string = this.defencountN;
        this.egglabel.string = this.eggs_count;
    },

    btnQueen(){
        for (var i=0;i<this.eggs.length;i++){
            if (this.eggs[i].getComponent("room_egg").antype == "queen"){
                this.eggs[i].destroy();
                this.eggs.splice(i,1);
                this.queencountN--;
                this.eggs_count++;
                break;
            }
        } 
        this.queencount.string = this.queencountN;
        this.egglabel.string = this.eggs_count;
    },

    btnClose(){
        this.node.destroy();
    },

    btnHatch(){
        var cost = (this.searchcountN + this.queencountN + this.defencountN)*200;
        if(cost <= 0) {
            return;
        }
        this.dialog = cc.instantiate(this.dlgPrefeb);
        this.dialog.parent = this.node;
        this.dialog.setPosition(0,0);
        this.dialog.getComponent("dialog").onClick("本操作将消耗"+ cost.toString() +"蚁币，是否确定？",function(self){
            return;
        },function(self){
            if(cost <= 0 || isNaN(store.getGolds()) || store.getGolds()<cost){
                cc.game.emit("tips","蚁币不足");
                return;
            }
            cc.game.emit("updateGolds",-cost);
            var rates = store.getHatchRate();
            self.hatchSearch(rates.search_rate);
            self.hatchDefen(rates.defen_rate);
            self.hatchQueen(rates.queen_rate);
        },this);  
    },

    hatchSearch(rate){
        for (var index=0;index < this.searchcountN;index++){
            let rand = this.random(1,10);
            if(rand <= rate*10){
                cc.game.emit("tips","恭喜！工蚁孵化成功！");
                cc.game.emit("insert_search_ant");
            }
        }
        cc.game.emit("updateEggs",-this.searchcountN);
        this.searchcountN = 0;
        this.searchcount.string = this.searchcountN;
    },

    hatchDefen(rate){
        for (var index=0;index < this.defencountN;index++){
            let rand = this.random(1,10);
            if(rand <= rate*10){
                cc.game.emit("tips","恭喜！兵蚁孵化成功！");
                cc.game.emit("insert_defen_ant");
            }
        }
        cc.game.emit("updateEggs",-this.defencountN);
        this.defencountN = 0;
        this.defencount.string = this.defencountN;
    },

    hatchQueen(rate){
        for (var index=0;index < this.queencountN;index++){
            let rand = this.random(1,10);
            if(rand <= rate*10){
                cc.game.emit("tips","恭喜！雄蚁孵化成功！");
                cc.game.emit("insert_queen_ant");
            }
        }
        cc.game.emit("updateEggs",-this.queencountN);
        this.queencountN = 0;
        this.queencount.string = this.queencountN;
    },

    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower+1)) + lower;   
    },

    touchStart(event){
        if (this.eggs_count > 0) {
            this.tmpEgg = cc.instantiate(this.egg_prefeb);
            this.tmpEgg.parent = this.node;
            this.tmpEgg.setPosition(this.node.convertToNodeSpaceAR(event.getLocation()));
            this.status = 0;
            this.eggs_count --;
            this.egglabel.string = this.eggs_count;
        }
        
    },

    touchCancel(event){
        if (this.tmpEgg != null && this.status == 0){
            this.tmpEgg.runAction(cc.moveTo(0.2, this.egg.getPosition()));
            this.eggs_count ++;
            this.egglabel.string = this.eggs_count;
        }
        
    },

    judgeDistance(from,to){
        let dir = to.sub(from);
        if (dir.mag() < 50){ 
            this.status = 1;
            this.tmpEgg.setPosition(to);
            return true;
        }
        return false;
    },

    start () {
        this.egglabel.string = this.eggs_count;
    },

    update(){

    }
});
