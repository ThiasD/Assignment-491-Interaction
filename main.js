
// GameBoard code below

var socket = io.connect("http://24.16.255.56:8888");

window.onload = function () {
    console.log("starting up da sheild");
    var field = document.getElementById("Something");
    var username = document.getElementById("Thias David");

    

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.radius = 10;
    this.visualRadius = 0;
    this.colors = ["Red", "Green", "Blue", "White"];
    Entity.call(this, game, this.radius + Math.random() * (1100 - this.radius * 2), this.radius + Math.random() * (900 - this.radius * 2));

    this.velocity = { x: Math.ceil(Math.random()) * 10, y: Math.ceil(Math.random() * 10) };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    } 
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setTeam = function (color) {
    this.team = color;
    if( color === "White"){ // Neutral team will be more evasive than others 
        this.visualRadius = 300;
    } else {
        this.visualRadius = 150;
    }
    
};



Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 1100;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 900;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 1100 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 900 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) { // going to check if we collide with an entity that is not itself
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.team === "White") { // White team switch
                this.setTeam(ent.team);
            } 
            
            // Red team cases
            else if (this.team === "Red" && 
            (ent.team === "Blue" || ent.team ==="Pink" || ent.team === "Orange")) { // Red team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Red" && 
            (ent.team === "Green" || ent.team === "Yellow" || ent.team === "Purple")){ // Red team wins
                ent.setTeam(this.team);
            }

            // Blue team cases
            else if(this.teamm === "Blue" && 
            (ent.team === "Green" || ent.team === "Purple" || ent.team === "Pink")){ // Blue team loses
                this.setTeam(ent.team); 
            }
            else if(this.team === "Blue" && 
            (ent.team === "Red" || ent.team === "Orange" || ent.team === "Yellow")){ // Blue team wins
                ent.setTeam(this.team);
            }

            // Green team cases
            else if(this.team === "Green" && 
            (ent.team === "Red" || ent.team === "Orange" || ent.team === "Yellow")){ // Green team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Green" && 
            (ent.team === "Blue" || ent.team === "Purple" || ent.team === "Pink")){ // Green team wins
                ent.setTeam(this.team);
            }

            // Yellow team cases
            else if(this.team === "Yellow" && 
            (ent.team === "Red" || ent.team === "Orange" || ent.team === "Blue")){ // Yellow team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Yellow" && 
            (ent.team === "Green" || ent.team === "Purple" || ent.team === "Pink")){ // Yellow team wins
                ent.setTeam(this.team);
            }

            // Purple team cases
            else if(this.team === "Purple" && 
            (ent.team === "Red" || ent.team === "Yellow" || ent.team === "Green")){ // Purple team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Purple" && 
            (ent.team === "Blue" || ent.team === "Pink" || ent.team === "Orange")){ // Purple team wins
                ent.setTeam(this.team); 
            }

            // Pink team cases
            else if(this.team === "Pink" && 
            (ent.team === "Yellow" || ent.team === "Green" || ent.team === "Purple")){ // Pink team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Pink" && 
            (ent.team === "Blue" || ent.team === "Orange" || ent.team === "Red")){ // Pink team wins
                ent.setTeam(this.team);
            }
            
            // Orange team cases
            else if(this.team === "Orange" && 
            (ent.team === "Purple" || ent.team === "Pink" || ent.team === "Blue")){ // Oramge team loses
                this.setTeam(ent.team);
            }
            else if(this.team === "Orange" && 
            (ent.team === "Red" || ent.team === "Yellow" || ent.team === "Green")){ // Orange team wins
                ent.setTeam(this.team);
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if ( // This if statement is all seven "win" statemnets toegther
                // The distance check code is moved to the front for a chance of short circutting
                dist > this.radius + ent.radius + 10 &&
                ((this.team === "Red" && 
                (ent.team === "Green" || ent.team === "Yellow" || ent.team === "Purple")) ||
                (this.team === "Blue" && 
                (ent.team === "Red" || ent.team === "Orange" || ent.team === "Yellow")) ||
                (this.team === "Green" && 
                (ent.team === "Blue" || ent.team === "Purple" || ent.team === "Pink")) || 
                (this.team === "Yellow" && 
                (ent.team === "Green" || ent.team === "Purple" || ent.team === "Pink")) ||
                (this.team === "Purple" && 
                (ent.team === "Blue" || ent.team === "Pink" || ent.team === "Orange")) ||
                (this.team === "Pink" && 
                (ent.team === "Blue" || ent.team === "Orange" || ent.team === "Red")) || 
                (this.team === "Orange" && 
                (ent.team === "Red" || ent.team === "Yellow" || ent.team === "Green")) ||
                ent.team === "White")
                ) { // Approach code
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (// This if statement is a copy and paste of the "lose" statements toegther
                dist > this.radius + ent.radius && 
                (this.team === "White" ||
                (this.team === "Red" && 
                (ent.team === "Blue" || ent.team ==="Pink" || ent.team === "Orange")) ||
                (this.teamm === "Blue" && 
                (ent.team === "Green" || ent.team === "Purple" || ent.team === "Pink")) ||
                (this.team === "Green" && 
                (ent.team === "Red" || ent.team === "Orange" || ent.team === "Yellow")) ||
                (this.team === "Yellow" && 
                (ent.team === "Red" || ent.team === "Orange" || ent.team === "Blue")) || 
                (this.team === "Purple" && 
                (ent.team === "Red" || ent.team === "Yellow" || ent.team === "Green")) ||
                (this.team === "Pink" && 
                (ent.team === "Yellow" || ent.team === "Green" || ent.team === "Purple")) ||
                (this.team === "Orange" && 
                (ent.team === "Purple" || ent.team === "Pink" || ent.team === "Blue"))
                )) { // Get away code
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }

            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;




};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.team;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};



// the "main" code begins here
var friction = 1;
var acceleration = 10000000;
var maxSpeed = 175;

var ASSET_MANAGER = new AssetManager();


ASSET_MANAGER.queueDownload("./stars.jpg");

ASSET_MANAGER.downloadAll(function () {
    //console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var list = [];

    for(var x = 0 ; x < 10 ; x++){ // will make 10 neutral circles
        var circle = new Circle(gameEngine);
        circle.setTeam("White");
        gameEngine.addEntity(circle);
        list.push(circle);
    }

    for (var i = 0; i < 42; i++) { // Will make 7 different teams of 6 circles
        circle = new Circle(gameEngine);
        if( i % 7 === 0 ){
            circle.setTeam("Red");
        }
        else if( i % 7 === 1){
            circle.setTeam("Green");
        }
        else if ( i % 7 === 2){
            circle.setTeam("Blue");
        }
        else if ( i % 7 === 3){
            circle.setTeam("Yellow");
        }
        else if ( i % 7 === 4){
            circle.setTeam("Purple");
        }
        else if ( i % 7 === 5){
            circle.setTeam("Pink");
        }
        else if ( i % 7 === 6){
            circle.setTeam("Orange");
        }

        gameEngine.addEntity(circle);
        list.push(circle);
    }
    
    var save = document.getElementById("s");
    var load = document.getElementById("l");


socket.on('load', function (data) {
    gameEngine.entities = [];
    for (x = 0 ; x < 52 ; x++){ // I have 52 circles in my game so I can hard code that in
        var circle = new Circle(gameEngine);
        
        circle.setTeam((data[x])[0]); // add the data[x] array to the circle
        circle.x = (data[x])[1];
        circle.y = (data[x])[2];
        circle.velocity = (data[x])[3];

        gameEngine.addEntity(circle); // add circle back to the game world
    }
});

socket.on('save', function (data) {
    var holdState = [];
    var holdCircle = [];
    for(const ent in gameEngine.entities){
        holdCircle = [];
        entity = gameEngine.entities[ent]; // access the current circles stuff
        
        holdCircle.push(entity.team); // store team, position, and velocity in a array
        holdCircle.push(entity.x);
        holdCircle.push(entity.y);
        holdCircle.push(entity.velocity);

        holdState.push(holdCircle); // store the circle array in a bigger array
    }
});


save.onClick = function(){
    console.log("Entered Save");
    socket.emit('save', {studentname: 'Thias David', statename: 'State Saved', data: holdState });
    console.log("Finished Save");
}

load.onClick = function (){
    console.log("Entered Load");
    socket.emit('load', {studentname: 'Thias David', statename: 'State Loaded'});
    console.log("Finished Load")
}




    gameEngine.init(ctx);
    gameEngine.start();
});
}


