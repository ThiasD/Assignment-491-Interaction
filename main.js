
// GameBoard code below

var socket = io.connect("http://24.16.255.56:8888");

window.onload = function () {
    console.log("starting up da sheild");
    var messages = [];
    var field = document.getElementById("7-wayTag");
    var username = document.getElementById("ThiasDavid");

    // socket.on("ping", function (ping) {
    //     console.log(ping);
    //     socket.emit("pong");
    // });

    socket.on('load', function (data) {
        console.log(data.length +" messages synced.");
        messages = data;
        var html = '';
        for (var i = 0; i < messages.length; i++) {
            html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
            html += messages[i].message + '<br />';
        }
        content.innerHTML = html;
        content.scrollTop = content.scrollHeight;
    });

    socket.on('save', function (data) {
        if (data.message) {
            messages.push(data);
            // update html
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });


function loadState(game, ListOfCircles){
    var list = [];
    var circle = new Circle(game);
    for( x = 0 ; x < ListOfCircles.length ; x++){
        circle.x = ListOfCircles[x].x;
        circle.y = ListOfCircles[x].y;
        circle.team = ListOfCircles[x].team;
        circle.velocity = ListOfCircles[x].velocity;
        circle.visualRadius = ListOfCircles[x].visualRadius;
        list.add(circle);
    }
    return list;
}

function saveState(game){
    var list = [];
    for (const ent in game.entities){
        entity = game.entities[ent];
        list.add(entity);
    }
    return list;
}

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

    for(var x = 0 ; x < 10 ; x++){ // will make 10 neutral circles
        var circle = new Circle(gameEngine);
        circle.setTeam("White");
        gameEngine.addEntity(circle);
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
    }
    gameEngine.init(ctx);
    gameEngine.start();
});

