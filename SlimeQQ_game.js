var game = new Phaser.Game( 1000 , 600 ,Phaser.AUTO,'game'); //產生game物件
game.States = {}; //存放state?象

var res_path = '.';

//啟動遊戲
game.States.boot = function(){
	this.preload = function(){
		if(!game.device.desktop){//移動裝置調整
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}
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
			alert('還沒寫好啦!');
		//	game.state.start('play');
		});
		btn.anchor.setTo(0.5,0.5);
	}
}


//把state加入遊戲
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('start_menu',game.States.start_menu);
//從boot開始
game.state.start('boot');