// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
      msg:{
         default:null,
         type:cc.Label,
      },
      title:{
          default:"",
      },
    },

    start () {
        switch (this.title){
            case "蚁速":
                this.msg.string = "蚂蚁的移动速度";
                break;
            case "蚁力":
                this.msg.string = "工蚁的力量，力量越强捕获物品的能力越大，同样探索物品的重量越大";
                break;
            case "蚁攻":
                this.msg.string = "兵蚁的攻击力";
                break;
            case "血量":
                this.msg.string = "兵蚁的血量";
                break;
            case "ant_eggs":
                this.msg.string = "蚁卵 -- 蚁后的宝宝，用来孵化工蚁、兵蚁、雄蚁，可去孵化室孵化相应种类的蚂蚁";
                break;
        }
    },

    onClose(){
        this.node.destroy();
    }
});
