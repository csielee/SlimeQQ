var targetWidth = 500;
var targetHeight = 400;



var game = new Phaser.Game( 1000 , 600 ,Phaser.AUTO,'game'); //產生game物件
//var game = new Phaser.Game( window.innerWidth , window.innerHeight ,Phaser.AUTO,'game'); //產生game物件
game.States = {}; //存放state對象

var res_path = '.';

//啟動遊戲
game.States.boot = function(){
	this.preload = function(){
		if(!game.device.desktop){//移動裝置調整
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}
		//game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    	//game.scale.pageAlignHorizontally = true;
    	//game.scale.pageAlignVertically = true;

		game.load.image('loading',res_path + '/img/preloader.gif');
	};
	this.create = function(){
		game.state.start('preload'); //跳到加載畫面
	};
}
//加載遊戲資源
game.States.preload = function(){
	this.preload = function(){
		//創造顯示loading的角色
		var preloadSprite = game.add.sprite(game.width/2,game.height/2,'loading'); 
		preloadSprite.anchor.setTo(0.5,0.5);
		game.load.setPreloadSprite(preloadSprite);
		
		
		game.load.image('background',res_path + '/img/SlimeQQ_background.png'); //背景
    	game.load.image('title',res_path + '/img/SlimeQQ_title.png'); //遊戲標題
		game.load.image('gameStart_btn',res_path + '/img/SlimeQQ_gameStart.png'); //開始按鈕
    	game.load.tilemap('map1',res_path + '/map/map1.json',null,Phaser.Tilemap.TILED_JSON);
    	game.load.image('ground1',res_path + '/res/ground1.png');
    	game.load.image('森林',res_path + '/res/森林.png');
    	game.load.image('磚頭地板',res_path + '/res/磚頭地板.png');

    	game.load.tilemap('map2',res_path + '/map/map2.json',null,Phaser.Tilemap.TILED_JSON);
    	//game.load.image('slime',res_path + '/res/slime.png');
    	game.load.spritesheet('slime',res_path + '/img/sv_slime_sheet.png',64,64,54);
    	game.load.spritesheet('weapon',res_path + '/img/Weapons.png',96,64,36);
    	//game.load.atlas();
    	/*
    	game.load.image('ground','assets/ground.png'); //地面
    	game.load.image('title','assets/title.png'); //游???
    	game.load.spritesheet('bird','assets/bird.png',34,24,3); //?
    	game.load.image('btn','assets/start-button.png');  //按?
    	game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
    	game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
    	game.load.audio('fly_sound', 'assets/flap.wav');//?翔的音效
    	game.load.audio('score_sound', 'assets/score.wav');//得分的音效
    	game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞?管道的音效
    	game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞?地面的音效

    	game.load.image('ready_text','assets/get-ready.png');
    	game.load.image('play_tip','assets/instructions.png');
    	game.load.image('game_over','assets/gameover.png');
    	game.load.image('score_board','assets/scoreboard.png');
    	*/
    	console.log('prelond finish!\n');
	}
	this.create = function(){
		game.state.start('start_menu');
	}
}
//遊戲開始選單
game.States.start_menu = function(){
	this.create = function(){
		game.add.tileSprite(0,0,game.width,game.height,'background'); //背景圖
		//game.add.tileSprite(0,game.height-112,game.width,112,'ground').autoScroll(-100,0); //地板
		var titleGroup = game.add.group(); //創建標題的群
		titleGroup.create(0,0,'title'); //標題
		//var bird = titleGroup.create(190, 10, 'bird'); //添加bird到?里
		//bird.animations.add('fly'); //添加??
		//bird.animations.play('fly',12,true); //播放??
		
		titleGroup.x = game.width/2 - titleGroup.width/2;
		titleGroup.y = game.height/2 - titleGroup.height/4;
		//titleGroup.anchor.setTo(0.5,0.5);
		game.add.tween(titleGroup).to({ y:game.height/2-(titleGroup.height*3)/4 },3000,null,true,0,Number.MAX_VALUE,true); //標題的緩動動畫
		var btn = game.add.button(game.width/2,game.height/2 + titleGroup.height,'gameStart_btn',function(){//?始按?
			//alert('還沒寫好啦!');
			game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);
	}
}

game.States.play = function(){
	this.preload = function(){
		game.physics.startSystem(Phaser.Physics.ARCADE);
	}
	this.create = function(){
		

		//game.map = game.add.tilemap('map1');
		//game.map.addTilesetImage('ground1','map1_tile');
		game.map = game.add.tilemap('map2');
		game.map.addTilesetImage('ground1','ground1');
		game.map.addTilesetImage('森林','森林');
		game.map.addTilesetImage('磚頭地板','磚頭地板');

		this.backgroundlayer1 = game.map.createLayer('BackgroundLayer1');
		this.backgroundlayer2 = game.map.createLayer('BackgroundLayer2');
		this.groundlayer = game.map.createLayer('GroundLayer');
		game.map.setCollisionBetween(2,240,true,'GroundLayer');

		this.backgroundlayer1.resizeWorld();

		this.player_group = game.add.group();
		//生成角色
		this.player = game.add.sprite(100,100,'slime');
		this.player.animations.add('move_left',[0,1,2,2,1,0],10,true);
		this.player.animations.add('move_right',[6,7,8,8,7,6],10,true);
		this.player.animations.add('attack',[12,13,14,12],6,false);
		this.player.anchor.setTo(0.5,0.5);
		this.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		//this.player.body.gravity.y = 2000;
		game.camera.follow(this.player);
		this.player_dir = 'left';

		this.player_group.add(this.player);

		//生成武器

		this.weapon = game.add.sprite(this.player.x,this.player.y,'weapon');
		this.weapon.animations.add('gun_shut',[15,16,17],6,false);
		this.weapon.anchor.setTo(0.7,0.5);
		this.physics.arcade.enable(this.weapon);

		this.player_group.add(this.weapon);
		
		this.weapon.frame = 17;

		

		//控制
		//game.input.onDown.add(this.attack,this);
		this.cursors = game.input.keyboard.createCursorKeys();

		//製作血條
		this.blood_max = 100;
		this.blood_value = this.blood_max;
		this.blood_show = game.add.graphics(0,game.camera.height-60);
		this.blood_show.fixedToCamera = true;

		//製作汙染條
		this.pollution_max = 100;
		this.pollution_value = 50;
		this.pollution_show_width = 150;
		this.pollution_show_height = 30;
		this.pollution_show = game.add.graphics(game.camera.width-(this.pollution_show_width+20),20);
		this.pollution_show.fixedToCamera = true;


		//debug資訊
		this.debug_show = game.add.text(20, 20, 'debug_show', { fontSize: '15px', fill: '#fff' });
		this.debug_show.fixedToCamera = true;
		this.debug_show.style.fill = '#fff';
		//this.debug_show.style.backgroundColor = '#000';

		//角色移動速度
		this.step = 70;
		this.speed = 700;

		//
		this.nextClick = this.time.now;
		this.Clickstep = 500;

	}
	this.update = function(){
		game.physics.arcade.collide(this.player,this.groundlayer);

		//this.player_group.setAll('body.velocity.x',this.player.body.velocity.x);
		//this.player_group.setAll('body.velocity.y',this.player.body.velocity.y);
		this.player_group.setAll('x',this.player.x);
		this.player_group.setAll('y',this.player.y);

		var IsMove = 0;
		
		if (this.cursors.up.isDown) {
			this.player.body.velocity.y = this.move(this.player.body.velocity.y,this.speed,-1*this.step);
		}  		
  		else if (this.cursors.down.isDown) {
 			this.player.body.velocity.y = this.move(this.player.body.velocity.y,this.speed,this.step);
  		}
  		else {
  			this.player.body.velocity.y += (-1*(this.player.body.velocity.y-0))/10;
  			//this.player.body.velocity.y = 0;
  			//this.player.body.velocity.y>0?this.player.body.velocity.y-=(this.step)*2:this.player.body.velocity.y+=(this.step)*2;
  			IsMove++;
  		}
  		
  		if (this.cursors.left.isDown) {
  			this.player.body.velocity.x = this.move(this.player.body.velocity.x,this.speed,-1*this.step);
  			this.player_dir = 'left';
  			this.player.animations.play('move_left');
  		}
  		else if (this.cursors.right.isDown) {
  			this.player.body.velocity.x = this.move(this.player.body.velocity.x,this.speed,this.step);
  			this.player_dir = 'right';
  			this.player.animations.play('move_right');
  		}
  		else {
  			this.player.body.velocity.x += (-1*(this.player.body.velocity.x-0))/10;
  			//this.player.body.velocity.x = 0;
  			if(IsMove == 1) {
  				if(this.player.body.velocity.x<=20 && this.player.body.velocity.y<=20) {
  				this.player.animations.stop();
  				if(this.player_dir == 'left')
  					this.player.frame = 2;
  				else
  					this.player.frame = 6;
  				}
  			}
  			else {
  				this.player.animations.play('move_'+this.player_dir);
  			}
  		}
  		if(game.input.keyboard.isDown(Phaser.Keyboard.Z))
  		{
  			//this.weapon.frame = (this.weapon.frame+1) % 36;	
  		}
  		if(game.input.keyboard.isDown(Phaser.Keyboard.X))
  		{
  			//this.weapon.frame = (this.weapon.frame+35) % 36;	
  		}
  		//武器跟著角色
  		//this.weapon.body.velocity.x = this.player.body.velocity.x;
  		//this.weapon.body.velocity.y = this.player.body.velocity.y;
  		//滑鼠按下
  		if(game.input.activePointer.isDown)
  		{
  			if(this.nextClick <= this.time.now)
  			{
  				this.weapon.animations.play('gun_shut');
  				this.nextClick = this.time.now + this.Clickstep;
  			}
  		}
  		//武器跟著滑鼠
  		this.weapon.rotation = game.physics.arcade.angleToPointer(this.weapon);
  		this.weapon.angle += 180;

  		if(this.player.body.blocked.down)
  		{
  			this.pollution_value = (this.pollution_value + 1) % this.pollution_max;
  			if(this.blood_value > 0)
  				this.blood_value-=5;
  		}
  		else
  		{
  			if(this.blood_value < this.blood_max)
  				this.blood_value+=5;
  		}



  		//血條顯示
  		this.blood_show.clear();
  		if(this.blood_value > 0) {
  			this.blood_show.beginFill(0x0000C6,0.8);
			this.blood_show.drawRoundedRect(0,0,game.camera.width*(this.blood_value/this.blood_max),40);
			this.blood_show.endFill();
		}

		//汙染條顯示
		this.pollution_show.clear();
		this.pollution_show.beginFill(0x2828FF);
		var temp = (this.pollution_value*this.pollution_show_width)/this.pollution_max;
		this.pollution_show.drawRect(temp,0,this.pollution_show_width-temp,this.pollution_show_height);
		this.pollution_show.beginFill(0xFF0000);
		this.pollution_show.drawRect(0,0,temp,this.pollution_show_height);
		this.pollution_show.endFill();

  		//debug資訊顯示
  		this.debug_show.text = 'debug資訊\nx:' + this.player.body.x + '\ny:' + this.player.body.y;
  		this.debug_show.text += '\nblood: '+this.blood_value + '/' + this.blood_max;
  		this.debug_show.text += '\npollution: '+this.pollution_value + '/' + this.pollution_max;
  		this.debug_show.text += '\nweapon f : '+this.weapon.frame;
  		this.debug_show.text += '\nweapon angle: '+this.weapon.angle+',weapon rotation: '+this.weapon.rotation;
	}
	this.move = function(value,speed,step) {
		var dir = step > 0?1:-1;
		/*
		if(dir*this.player.body.velocity.x <= speed)
			this.player.body.velocity.x += step;
		else
			this.player.body.velocity.x = dir*speed;
		*/
		if(dir*value <= speed)
			value += step;
		else
			value = dir*speed;
		return value;
	}

	this.attack = function() {
		this.player.animations.play('attack');
	}

}


//把state加入遊戲
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('start_menu',game.States.start_menu);
game.state.add('play',game.States.play)
//從boot開始
game.state.start('boot');