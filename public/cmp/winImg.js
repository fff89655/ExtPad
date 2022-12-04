var template = `
<div v-if="screenSize" class="winImg">
    <div v-if="rect" class="winRect" :style="{top:rectAct.y + 'px', left:rectAct.x + 'px', width:rectAct.width + 'px', height:rectAct.height + 'px'}"></div>
</div>  
`;
Vue.component('winimg', {
  props: ["rect", "screenSize"],
  template: template,
  data: function () {
    return {rectAct:{}};
  },
  created: function () {

  },
  watch: {
    rect: function(newVal, oldVal) {
      let thisWidth = 40;
      let thisHeight = 40;
      this.rectAct.x = (newVal.x / this.screenSize.width) * thisWidth;
      this.rectAct.y = (newVal.y / this.screenSize.height) * thisHeight;
      this.rectAct.width = (newVal.width / this.screenSize.width) * thisWidth;
      this.rectAct.height = (newVal.height / this.screenSize.height) * thisHeight;
    }
  },
  methods: {
  }
})