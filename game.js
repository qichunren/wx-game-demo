import './js/libs/weapp-adapter'
import './js/libs/melonjs'

var game = {
  // game assets
  assets: [
    { name: "alien", type: "image",   src: "data/gfx/alien.png" },
    { name: "brick", type: "image",   src: "data/gfx/brick.png" },
    { name: "flushed", type: "image", src: "data/gfx/flushed.png" },
    { name: "scream", type: "image",  src: "data/gfx/scream.png" },
    { name: "smile", type: "image",   src: "data/gfx/smile.png" },
    { name: "smirk", type: "image",   src: "data/gfx/smirk.png" }    
  ],

  onload: function () {
    // Initialize the video.
    if (!me.video.init(320, 568, {  renderer: me.video.CANVAS })) {
      alert("Your browser does not support HTML5 canvas.");
      return;
    }

    // set all resources to be loaded
    me.loader.preload(game.assets, this.loaded.bind(this));
  },

  loaded: function () {
    // set the "Play/Ingame" Screen Object
    me.state.set(me.state.PLAY, new PlayScreen());

    // switch to PLAY state
    console.log("State changed to Play.");
    me.state.change(me.state.PLAY);
  }
};

var PlayScreen = me.ScreenObject.extend({
  onResetEvent: function () {
    console.log("PlayScreen reset event");
    // clear the background
    me.game.world.addChild(new me.ColorLayer("background", "#5E3F66", 0), 0);
    console.log("PlayScreen reset event 1");

    // Add some objects
    
    for (var i = 0; i < 3; i++) {
      console.log("Image:", i);
      me.game.world.addChild(new Smilie(i), 3);
    }
    

    me.game.world.addChild(new game.Rect(), 1);

    console.log("PlayScreen reset event 2");
  }
});

game.Rect = me.Renderable.extend({
  init: function () {
    this._super(me.Renderable, "init", [0, 0, 140, 140]);
  },
  update: function () {
    return true;
  },
  destroy: function () { },
  draw: function (renderer) {
    var color = renderer.getColor();
    renderer.setColor('#5EFF7E');
    //console.log("this.height in draw method:", this.height);
    renderer.fillRect(0, 0, this.width, this.height);
    renderer.setColor(color);

    this.alwaysUpdate = true;
  }
});


game.Laser = me.Entity.extend({
  init: function (x, y) {
    this._super(me.Entity, "init", [x, y, { width: game.Laser.width, height: game.Laser.height }]);
    this.z = 5;
    this.body.gravity = 0;
    // this.body.setVelocity(0, 300);
    this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
    this.renderable = new (me.Renderable.extend({
      init: function () {
        this._super(me.Renderable, "init", [0, 0, game.Laser.width, game.Laser.height]);
      },
      destroy: function () { },
      draw: function (renderer) {
        var color = renderer.getColor();
        renderer.setColor('#5EFF7E');
        renderer.fillRect(0, 0, this.width, this.height);
        renderer.setColor(color);
      }
    }));
    this.alwaysUpdate = true;
  },

  update: function (time) {
    this.body.vel.y -= this.body.accel.y * time / 1000;
    if (this.pos.y + this.height <= 0) {
      console.log("update laser");
      me.game.world.removeChild(this);
    }

    this.body.update();
    me.collision.check(this);

    return true;
  }
});

game.Laser.width = 5;
game.Laser.height = 28;

var Smilie = me.Entity.extend({
  init: function (i) {
    //console.log("Smile begin init");
    this._super(
      me.Entity,
      "init",
      [
        me.Math.randomFloat(-15, 320),
        me.Math.randomFloat(-15, 568),
        {
          width: 16,
          height: 16,
          shapes: [new me.Ellipse(4, 4, 8, 8)]
        }
      ]
    );
    console.log("Smile begin init 1");

    // disable gravity and add a random velocity
    this.body.gravity = 0;
    this.body.vel.set(me.Math.randomFloat(-4, 4), me.Math.randomFloat(-4, 4));

    this.alwaysUpdate = true;
    
    var image_name = game.assets[i % 5].src;
    var img = me.loader.getImage(image_name);
    console.log("image name:", image_name);
    console.log("img type", img);

    // add the coin sprite as renderable
    this.renderable = new me.Sprite(0, 0, {
      framewidth: 16,
      frameheight: 16, anchorPoint: new me.Vector2d(0.5, 0.5), image: img });
    console.log("Smile begin init finished.");
  },

  update: function () {
    // console.log("xxx");  
    this.pos.add(this.body.vel);

    // world limit check
    if (this.pos.x >= 1024) {
      this.pos.x = -15;
    }
    if (this.pos.x < -15) {
      this.pos.x = 1024 - 1;
    }
    if (this.pos.y >= 768) {
      this.pos.y = -15;
    }
    if (this.pos.y < -15) {
      this.pos.y = 768 - 1;
    }

    if (me.collision.check(this)) {
      // me.collision.check returns true in case of collision
      this.renderable.setOpacity(1.0);
    }
    else {
      this.renderable.setOpacity(0.5);
    }
    return true;
  },

  // collision handler
  onCollision: function (response) {

    this.pos.sub(response.overlapN);
    if (response.overlapN.x !== 0) {
      this.body.vel.x = me.Math.randomFloat(-4, 4) * -Math.sign(this.body.vel.x);
    }
    if (response.overlapN.y !== 0) {
      this.body.vel.y = me.Math.randomFloat(-4, 4) * -Math.sign(this.body.vel.y);
    }

    return false;
  }
});

/* Bootstrap */
me.device.onReady(function onReady() {
  game.onload();
});
