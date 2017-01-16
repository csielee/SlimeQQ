var game = new Phaser.Game( 1000 , 600 ,Phaser.AUTO,'game'); //產生game物件
//var game = new Phaser.Game( window.innerWidth , window.innerHeight ,Phaser.AUTO,'game'); //產生game物件
game.States = {}; //存放state對象

var res_path = '.';
var debug_div = document.getElementById("debug");
var self_name;
var pollution_value;
var gamewin = false;

var database = firebase.database();

function quitgame() {
	firebase.database().ref('SlimeQQ/'+self_name).set(null);
}

//生成所有玩家的group
var players;

var other = {};
var other_name = {};
var other_weapon = {};
var other_bullet = {};


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
    	game.load.spritesheet('weapon',res_path + '/img/Weapons1+3.png',96,64,72);
    	//game.load.spritesheet('bullet',res_path + '/img/rgblaser.png', 4, 4);
    	game.load.spritesheet('bullet',res_path + '/img/bullet163.png', 14, 14);
    	//game.load.atlas();
    	game.load.audio('gun_fire_audio',res_path + '/audio/gun_fire.mp3');
    	game.load.audio('title_audio',res_path + '/audio/標題背景音樂.mp3');
    	game.load.audio('game_audio',res_path + '/audio/弓箭手村東部背景音樂.mp3');

    	console.log('prelond finish!\n');
	}
	this.create = function(){
		game.state.start('start_menu');
	}
}
//遊戲開始選單
game.States.start_menu = function(){
	this.create = function(){
		var background_sound = game.add.audio('title_audio',0.7,true);
		background_sound.play();
		console.log('title sound play!\n');

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
			self_name = prompt("輸入角色的暱稱","");
			background_sound.stop();
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
		//this.player = createSlime(100,100);
		this.player = createSlime(Math.random()*game.world.width,Math.random()*game.world.height);
		this.player.body.immovable = false;
		game.camera.follow(this.player);
		this.player_dir = 'left';

		this.player_group.add(this.player);
		//生成武器
		this.weapon = createWeapon(this.player.x,this.player.y);

		this.player_group.add(this.weapon);		
		//生成武器子彈
		this.bullet = createBullet();
		this.bullet.trackSprite(this.weapon, 60, 0, true);
		//子彈發生頻率跟武器動畫
		this.nextClick = this.time.now;
		this.Clickstep = 500;
		this.bullet.fireRate = this.Clickstep;

		//生成角色名稱
		this.player_name = game.add.text(this.player.x,this.player.y,self_name,{fontSize: '15px', fill: '#000'});
		this.player_name.anchor.setTo(0.5,0);
		this.physics.arcade.enable(this.player_name);
		this.player_name.body.offset.y = 32;

		this.player_group.add(this.player_name);

		//控制
		this.cursors = game.input.keyboard.createCursorKeys();

		//製作血條
		this.blood_max = 100;
		this.blood_value = this.blood_max;
		this.blood_show = game.add.graphics(0,game.camera.height-60);
		this.blood_show.fixedToCamera = true;
		//回血機制
		this.nextHeal = this.time.now;
		this.Healstep = 500;

		//製作汙染條
		this.pollution_max = 500;
		pollution_value = 250;
		this.pollution_show_width = 150;
		this.pollution_show_height = 30;
		this.pollution_show = game.add.graphics(game.camera.width-(this.pollution_show_width+20),20);
		this.pollution_show.fixedToCamera = true;

		//debug資訊
		this.debug_show = game.add.text(20, 20, 'debug_show', { fontSize: '15px', fill: '#fff' });
		this.debug_show.fixedToCamera = true;
		this.debug_show.style.fill = '#fff';

		//角色移動速度
		this.step = 2000;
		this.speed = 700;
    	this.player.body.maxVelocity.set(this.speed);

    	//遊戲音效
    	this.background_sound = game.add.audio('game_audio',0.7,true);
    	this.background_sound.play();
    	this.gun_fire_sound = game.add.audio('gun_fire_audio');

    	//上傳自己的資料到資料庫
    	firebase.database().ref('SlimeQQ/'+self_name).set({
        	"player_name": self_name,
        	"player_dir": this.player_dir,
        	"player_Ismove": 0,
        	"player_state": "live",
        	"player_tint": this.player.tint,
        	"weapon_angle": 0,
        	"bullet_shots": this.bullet.shots,        
        	"point": {
          		"x": Math.floor(this.player.x),
          		"y": Math.floor(this.player.y)
        	}        
      	});

    	//生成所有玩家的group
    	players = game.add.group();
    	players.add(this.player);

    	//讀取其它在線上的玩家資料
    	firebase.database().ref('SlimeQQ').once('value',function(snapshot) {

      		snapshot.forEach(function(item) {
        		if(item.key != self_name && other[item.key]==null)
        		{
        			//生成角色
					other[item.key] = createSlime(item.val().point.x,item.val().point.y);
					other[item.key].tint = item.val().player_tint;

					if(item.val().player_Ismove == 1) {
						other[item.key].animations.play('move_'+item.val().player_dir);
					}
					else {
						if(item.val().player_dir == 'left')
  							other[item.key].frame = 2;
  						else
  							other[item.key].frame = 6;
					}
					//生成武器
					other_weapon[item.key] = createWeapon(item.val().point.x,item.val().point.y);
					other_weapon[item.key].angle = item.val().weapon_angle;

					if(item.val().player_dir == 'left' && other_weapon[item.key].frame<36)
  						other_weapon[item.key].frame += 42;
  					else if(item.val().player_dir == 'right' && other_weapon[item.key].frame >35)
  						other_weapon[item.key].frame -= 42;

					//生成武器子彈
					other_bullet[item.key] = createBullet();
					other_bullet[item.key].trackSprite(other_weapon[item.key],60,0,true);
					other_bullet[item.key].shots = item.val().bullet_shots;

					//生成角色名字
					other_name[item.key] = game.add.text(other[item.key].x,other[item.key].y,item.val().player_name,{fontSize: '15px', fill: '#000'});
					other_name[item.key].anchor.setTo(0.5,0);
					game.physics.arcade.enable(other_name[item.key]);
					other_name[item.key].y += 20;

					//如果已經死亡
					if(item.val().player_state == "dead") {
						other[item.key].animations.stop();
						other[item.key].frame = 52;
						other[item.key].body.enable = false;
					}
					if(item.val().player_state == "win") {
  						other[item.key].animations.stop();
						other[item.key].frame = 27;
						other[item.key].body.enable = false;					
					}

					//加入玩家碰撞群組
					players.add(this.other[item.key]);
        		}
    		});


  		});
    	//同步其它玩家的資訊
  		firebase.database().ref('SlimeQQ').on('child_changed',function(child) {
  			if(child.key != self_name)
  			{
  				//更新位置
  				other[child.key].x = child.val().point.x;
  				other[child.key].y = child.val().point.y;
  				other_name[child.key].x = other[child.key].x;
  				other_name[child.key].y = other[child.key].y + 20;
  				other_weapon[child.key].x = other[child.key].x;
  				other_weapon[child.key].y = other[child.key].y;

  				//更新方向
  				if(child.val().player_Ismove == 1) {
  					other[child.key].animations.play('move_'+child.val().player_dir);
  				}
  				else {
  					other[child.key].animations.stop();
  					if(child.val().player_dir == 'left')
  						other[child.key].frame = 2;
  					else
  						other[child.key].frame = 6;
  				}
  				//更新武器方向
  				other_weapon[child.key].angle = child.val().weapon_angle;
  				if(child.val().player_dir == 'left' && other_weapon[child.key].frame<36)
  					other_weapon[child.key].frame += 42;
  				else if(child.val().player_dir == 'right' && other_weapon[child.key].frame >35)
  					other_weapon[child.key].frame -= 42;

  				//發射子彈
  				if(other_bullet[child.key].shots != child.val().bullet_shots)
  				{
  					other_bullet[child.key].fire();
  					other_weapon[child.key].animations.play('gun_shut_'+child.val().player_dir);
  				}

  				//更新存活狀態
  				if(child.val().player_state == "dead") {
  					other[child.key].animations.stop();
					other[child.key].frame = 52;
					other[child.key].body.enable = false;
				}
				if(child.val().player_state == "win") {
  					other[child.key].animations.stop();
					other[child.key].frame = 27;
					other[child.key].body.enable = false;					
				}

				//更新顏色
				other[child.key].tint = child.val().player_tint;
  			}
  		});
  		//有玩家加入遊戲
  		firebase.database().ref('SlimeQQ').on('child_added',function(child) {
  			if(child.key != self_name && other[child.key]==null)
  			{
  				//生成角色
				other[child.key] = createSlime(child.val().point.x,child.val().point.y);
				other[child.key].tint = child.val().player_tint;

				if(child.val().player_Ismove == 1) {
						other[child.key].animations.play('move_'+child.val().player_dir);
				}
				else {
					if(child.val().player_dir == 'left')
  						other[child.key].frame = 2;
  					else
  						other[child.key].frame = 6;
				}

				//生成武器
				other_weapon[child.key] = createWeapon(child.val().point.x,child.val().point.y);
				other_weapon[child.key].angle = child.val().weapon_angle;

				if(child.val().player_dir == 'left' && other_weapon[child.key].frame<36)
  					other_weapon[child.key].frame += 42;
  				else if(child.val().player_dir == 'right' && other_weapon[child.key].frame >35)
  					other_weapon[child.key].frame -= 42;

				//生成武器子彈
				other_bullet[child.key] = createBullet();
				other_bullet[child.key].trackSprite(other_weapon[child.key],60,0,true);
				other_bullet[child.key].shots = child.val().bullet_shots;


				//生成角色名字
				other_name[child.key] = game.add.text(other[child.key].x,other[child.key].y,child.val().player_name,{fontSize: '15px', fill: '#000'});
				other_name[child.key].anchor.setTo(0.5,0);
				game.physics.arcade.enable(other_name[child.key]);
					other_name[child.key].y += 20;

									//如果已經死亡
				if(child.val().player_state == "dead") {
					other[child.key].animations.stop();
					other[child.key].frame = 52;
					other[child.key].body.enable = false;
				}
				if(child.val().player_state == "win") {
  					other[child.key].animations.stop();
					other[child.key].frame = 27;
					other[child.key].body.enable = false;					
				}	

				//加入玩家碰撞群組
				players.add(other[child.key]);


  			}
  		});

  		//有玩家離開遊戲
  		firebase.database().ref('SlimeQQ').on('child_removed',function(child) {
  			if(child.key != self_name) {
  				other[child.key].destroy();
  				other[child.key] = null;
  				other_name[child.key].destroy();
  				other_name[child.key] = null;
  				other_weapon[child.key].destroy();
  				other_weapon[child.key] = null;
  				other_bullet[child.key].destroy();
  				other_bullet[child.key] = null;
  			}
  			else
  				self_name = 0;
  		});

		this.hasDead = false;
	}
	this.update = function(){
		game.physics.arcade.collide(players,this.groundlayer);
		game.physics.arcade.collide(this.bullet.bullets,this.groundlayer,this.bulletHitGround);
		game.physics.arcade.overlap(this.bullet.bullets,players,this.bulletHitOther);
		game.physics.arcade.collide(players);
		for(var key in other_bullet) {
			if(other_bullet[key]!=null) {
				game.physics.arcade.collide(other_bullet[key].bullets,this.groundlayer,this.bulletHitGround);
				game.physics.arcade.overlap(other_bullet[key].bullets,this.player,this.bulletHitSelf,null,this);
			}
		}
		var updateData = {};

		this.player_group.setAll('body.velocity.x',this.player.body.velocity.x);
		this.player_group.setAll('body.velocity.y',this.player.body.velocity.y);
		this.player_group.setAll('x',this.player.x);
		this.player_group.setAll('y',this.player.y);
		this.player_name.y += 20;

		//活著才能動
		if(!this.hasDead) {


		//武器跟著滑鼠
  		this.weapon.rotation = game.physics.arcade.angleToPointer(this.weapon);
  		this.bullet.fireAngle = this.weapon.angle;

  		if(Math.abs(this.weapon.angle)<=90)
  			this.player_dir = 'right';
  		else
  			this.player_dir = 'left';


		var IsMove = 1;
		
		if (this.cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
			//this.player.body.velocity.y = this.move(this.player.body.velocity.y,this.speed,-1*this.step);
			this.player.body.acceleration.y = -1*this.step;
		}  		
  		else if (this.cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
 			//this.player.body.velocity.y = this.move(this.player.body.velocity.y,this.speed,this.step);
 			this.player.body.acceleration.y = this.step;
  		}
  		else {
  			this.player.body.velocity.y += (-1*(this.player.body.velocity.y-0))/10;
  			this.player.body.acceleration.y = 0;
  			//this.player.body.velocity.y = 0;
  			//this.player.body.velocity.y>0?this.player.body.velocity.y-=(this.step)*2:this.player.body.velocity.y+=(this.step)*2;
  			IsMove--;
  		}
  		
  		if (this.cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
  			//this.player.body.velocity.x = this.move(this.player.body.velocity.x,this.speed,-1*this.step);  			
  			this.player.body.acceleration.x = -1*this.step;
  			this.player.animations.play('move_'+this.player_dir);
  		}
  		else if (this.cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
  			//this.player.body.velocity.x = this.move(this.player.body.velocity.x,this.speed,this.step);
  			this.player.body.acceleration.x = this.step;
  			this.player.animations.play('move_'+this.player_dir);
  		}
  		else {
  			this.player.body.velocity.x += (-1*(this.player.body.velocity.x-0))/10;
  			this.player.body.acceleration.x = 0;
  			if(IsMove == 0) {
  				if(this.player.body.velocity.x<=20 && this.player.body.velocity.y<=20) {

  				this.player.animations.stop();
  				if(this.player_dir == 'left')
  					this.player.frame = 2;
  				else
  					this.player.frame = 6;
  				}
  				else
  					IsMove = 1;
  			}
  			else {
  				this.player.animations.play('move_'+this.player_dir);
  			}
  		}
  		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
  		{
  			this.player.tint = Math.random() * 0xffffff;
  			updateData['SlimeQQ/'+self_name+'/player_tint'] = this.player.tint;	
  		}
  		//滑鼠按下
  		if(game.input.activePointer.isDown)
  		{
  			if(this.nextClick <= this.time.now)
  			{
  				this.bullet.fire();
  				this.weapon.animations.play('gun_shut_'+this.player_dir);
  				this.gun_fire_sound.play();
  				this.nextClick = this.time.now + this.Clickstep;

  				pollution_value += 10;
  				if(pollution_value > this.pollution_max)  					
  					pollution_value = this.pollution_max;

  			}
  			
  		}
  		else
  		{
  			if(this.player_dir == 'left' && this.weapon.frame<36) {
  				this.weapon.frame += 42;
  			}
  			else if(this.player_dir == 'right' && this.weapon.frame>35){
  				this.weapon.frame -= 42;
  			}
  		}

  		}

  		//血條顯示
  		this.blood_show.clear();
  		if(this.blood_value > 0) {
  			this.blood_show.beginFill(0x0000C6,0.8);
			this.blood_show.drawRoundedRect(0,0,game.camera.width*(this.blood_value/this.blood_max),40);
			this.blood_show.endFill();
		}
		else {
			//角色死亡
			if(!this.hasDead) {
				this.hasDead = true;
				this.player.frame = 52;
				this.player.body.enable = false;
				updateData['SlimeQQ/'+self_name+'/player_state'] = "dead";
				firebase.database().ref().update(updateData);
				var gameoverText = game.add.text(500,300,'你已經死亡\n保護水資源不容易\n請多加油\n按一下重新加入遊戲\n',{fontSize: '100px', fill: '#000', align: 'center'});
				gameoverText.fixedToCamera = true;
				gameoverText.anchor.setTo(0.5,0.5);
				//gameoverText.setTextBounds(500,300,1000,600);
				//點擊螢幕重新開始
				game.input.onDown.addOnce(function() {
					quitgame();
					location.reload(); 
					//game.state.start('start_menu');
				}, this);
			}
		}
		//隨時間回血
		if(this.blood_value < this.blood_max && this.nextHeal <= this.time.now) {
			this.blood_value++;
			this.nextHeal = this.time.now + this.Healstep;
		}

		//汙染條顯示
		this.pollution_show.clear();
		this.pollution_show.beginFill(0x2828FF);
		var temp = (pollution_value*this.pollution_show_width)/this.pollution_max;
		this.pollution_show.drawRect(temp,0,this.pollution_show_width-temp,this.pollution_show_height);
		this.pollution_show.beginFill(0xFF0000);
		this.pollution_show.drawRect(0,0,temp,this.pollution_show_height);
		this.pollution_show.endFill();
		//汙染死亡
		if(pollution_value >= this.pollution_max){
			if(!this.hasDead) {
				this.hasDead = true;
				this.player.frame = 52;
				this.player.body.enable = false;
				updateData['SlimeQQ/'+self_name+'/player_state'] = "dead";
				firebase.database().ref().update(updateData);
				var gameoverText = game.add.text(500,300,'汙染過於嚴重\n史萊姆無法生存\n勿浪費水資源增加汙染\n按一下重新加入遊戲\n',{fontSize: '100px', fill: '#000', align: 'center'});
				gameoverText.fixedToCamera = true;
				gameoverText.anchor.setTo(0.5,0.5);
				//gameoverText.setTextBounds(500,300,1000,600);
				//點擊螢幕重新開始
				game.input.onDown.addOnce(function() {
					quitgame();
					location.reload(); 
					//game.state.start('start_menu');
				}, this);
			}
		}
		//清除汙染
		if(pollution_value <= 0){
			if(!this.hasDead) {
				this.hasDead = true;
				this.player.frame = 27;
				this.player.body.enable = false;
				updateData['SlimeQQ/'+self_name+'/player_state'] = "win";
				firebase.database().ref().update(updateData);
				var gameoverText = game.add.text(500,300,'感謝你\n史萊姆們可以使用\n乾淨的水資源了\n按一下可重新遊戲\n',{fontSize: '100px', fill: '#000', align: 'center'});
				gameoverText.fixedToCamera = true;
				gameoverText.anchor.setTo(0.5,0.5);
				//gameoverText.setTextBounds(500,300,1000,600);
				//點擊螢幕重新開始
				game.input.onDown.addOnce(function() {
					quitgame();
					location.reload(); 
					//game.state.start('start_menu');
				}, this);
			}
		}

  		//debug資訊顯示
  		this.debug_show.text = 'debug資訊\nx:' + this.player.body.x + '\ny:' + this.player.body.y;
  		this.debug_show.text += '\nV :'+this.player.body.velocity + 'max V: ' + this.player.body.maxVelocity;
  		this.debug_show.text += '\nblood: '+this.blood_value + '/' + this.blood_max;
  		this.debug_show.text += '\npollution: '+pollution_value + '/' + this.pollution_max;
  		this.debug_show.text += '\nweapon f : '+this.weapon.frame;
  		this.debug_show.text += '\nweapon angle: '+this.weapon.angle+',weapon rotation: '+this.weapon.rotation;
  		this.debug_show.text += '\nplayer tine: '+this.player.tint;
  		this.debug_show.text += '\nWeapon shots: '+this.bullet.shots;

  		//debug_div.textContent = this.debug_show.text;

  		this.debug_show.text = '';

  		//更新在資料庫上的資料
  		if(!this.hasDead) {
  		updateData['SlimeQQ/'+self_name+'/player_dir'] = this.player_dir;
  		updateData['SlimeQQ/'+self_name+'/point'] = { "x": Math.floor(this.player.x),"y": Math.floor(this.player.y)};   
  		updateData['SlimeQQ/'+self_name+'/player_Ismove'] = IsMove;
  		updateData['SlimeQQ/'+self_name+'/weapon_angle'] = this.weapon.angle;
  		updateData['SlimeQQ/'+self_name+'/bullet_shots'] = this.bullet.shots;
  		firebase.database().ref().update(updateData);
  		}

  		this.player.bringToTop();
    	this.weapon.bringToTop();
    	this.player_name.bringToTop();
    	//this.blood_show.bringToTop();
    	//this.pollution_show.bringToTop();
	}
	this.render = function() {
		//this.player.debug();
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
	this.bulletHitGround = function(bullet,ground) {
		bullet.kill();
	}
	this.bulletHitSelf = function(self,bullet) {
		bullet.kill();
		this.blood_value -= 10;
		this.nextHeal = game.time.now + 1000;
	}
	this.bulletHitOther = function(bullet,other) {
		bullet.kill();
		console.log("hit other");
		pollution_value -= 20;
		if(pollution_value < 0) {
			pollution_value = 0;
			gamewin = true;
		}
	}



}

//把state加入遊戲
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('start_menu',game.States.start_menu);
game.state.add('play',game.States.play)
//從boot開始
game.state.start('boot');

var createSlime = function(x,y) {
	var slime = game.add.sprite(x,y,'slime');

    slime.animations.add('move_left',[0,1,2,2,1,0],10,true);
	slime.animations.add('move_right',[6,7,8,8,7,6],10,true);

	slime.anchor.setTo(0.5,0.6);
	game.physics.arcade.enable(slime);
	slime.body.collideWorldBounds = true;
	slime.body.setSize(50,40,7,24);
	slime.body.immovable = true;

	return slime;
}

var createWeapon = function(x,y) {
	var weapon = game.add.sprite(x,y,'weapon');
	weapon.frame = 12;
	weapon.animations.add('gun_shut_right',[14,13,12],9,false);
	weapon.animations.add('gun_shut_left',[56,55,54],9,false);
	weapon.anchor.setTo(0.2,0.5);
	game.physics.arcade.enable(weapon);

	return weapon;
}

var createBullet = function() {
	var bullet = game.add.weapon(40, 'bullet');
	//bullet.setBulletFrames(0, 80, true);
	bullet.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
	bullet.bulletKillDistance = 500;
	bullet.bulletSpeed = 1400;
	bullet.bulletInheritSpriteSpeed = true;
	bullet.fireRate = 500;

	return bullet;
}