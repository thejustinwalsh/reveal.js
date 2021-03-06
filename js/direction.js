
var deg2rad = Math.PI/180, rad2deg = 180/Math.PI;

var fireBullet = false;
var bulletDelay = 0.075;
var bulletTimer = 0;

// Draw a grid
var grid = new Group();
var bounds = view.bounds;
Utils.drawGrid(50, 50, view.bounds, grid);
grid.position = view.center;

function createTurret(position, radius)
{
  var turretOuter = new Path.Circle(new Point(0, 0), radius);
  turretOuter.strokeColor = 'white';
  turretOuter.strokeWidth = 5;
  turretOuter.strokeCap = 'round';
  turretOuter.dashArray = [360/15, 360/15];
  turretOuter.fillColor = new Color(0.0, 1.0, 0.0, 0.1);

  var turretCenter = new Path.Circle(new Point(0, 0), 5);
  turretCenter.fillColor = 'white';

  var turret = new Group(turretOuter, turretCenter);
  turret.position = position;

  turret.meta = {};
  turret.meta.getRadius = function() {
    return turretOuter.bounds.width / 2;
  }

  turret.meta.setFillColor = function(color) {
    turretOuter.fillColor = color;
  }

  return turret;
}

function createPlayer(position, radius, showBounds)
{
  showBounds = (showBounds === true ? showBounds : false);

  var playerOuter;
  if (showBounds) {
    playerOuter = new Path.Circle(new Point(0, 0), radius);
    playerOuter.strokeColor = 'white';
    playerOuter.strokeWidth = 2;
    playerOuter.fillColor = new Color(1.0, 0.0, 1.0, 0.1);
  }

  var playerCenter = new Path.Circle(new Point(0, 0), 10);
  playerCenter.fillColor = 'white';

  var player = new Group(showBounds ? [playerOuter, playerCenter] : [playerCenter]);
  player.position = position;

  player.meta = {};
  player.meta.getRadius = function() {
    return (showBounds ? playerOuter.bounds.width / 2 : playerCenter.bounds.width / 2);
  }

  player.meta.setFillColor = function(color) {
    playerOuter.fillColor = color;
  }

  return player;
}

function createBullet(position, radius, angle, color)
{
  var bullet = new Path.Circle(position, radius);
  bullet.fillColor = color;
  bullet.strokeColor = 'black';
  
  bullet.meta = {};
  bullet.meta.angle = angle;
  bullet.meta.t = 0;
  
  return bullet;
}

var turret = createTurret(new Point(0, 0), 175);
var player = createPlayer(new Point(view.center), 50, true);

function onMouseMove(event) {
  player.position = event.point;

  var distance = Math.sqrt(((turret.position.x - player.position.x) * (turret.position.x - player.position.x)) + ((turret.position.y - player.position.y) * (turret.position.y - player.position.y)));

  var radius = turret.meta.getRadius();
  var playerRadius = player.meta.getRadius();
  if ((distance - playerRadius) < radius) {
    turret.meta.setFillColor(new Color(1.0, 0.0, 0.0, 0.1));
    fireBullet = true;
  }
  else {
    turret.meta.setFillColor(new Color(0.0, 1.0, 0.0, 0.1));
    fireBullet = false;
    bulletTimer = bulletDelay;
  }
}

// Animate
var bullets = [];
var deadBullets = [];
function onFrame(event) {
  if (fireBullet) {
    bulletTimer += event.delta;
    
    if (bulletTimer >= bulletDelay) {
      var direction = player.position - turret.position;
      var angle = Math.atan2(direction.y, direction.x);
      bullets.push(createBullet(turret.position, 10, angle, new Color(0.0, 1.0, 1.0, 0.5)));
      bulletTimer = 0;
    }
  }
  
  deadBullets = [];
  for (var i = 0; i < bullets.length; i++)
  {
    var bullet = bullets[i];
    
    bullet.meta.t += event.delta;
    var x = Math.cos(bullet.meta.angle) * 5;
    var y = Math.sin(bullet.meta.angle) * 5;
    bullet.position = bullet.position + new Point(x, y);
    
    if (bullet.meta.t >= 3.0) {
      bullet.remove();
      deadBullets.push(i);
    }
  }
  
  deadBullets.sort(function(a, b) { return b - a; });
  for (i = 0; i < deadBullets.length; ++i) {
    bullets.splice(deadBullets[i], 1);
  }
}

// Resize the view
function onResize(event) {
  project.activeLayer.fitBounds(view.bounds, true);
  grid.position = view.center;
  turret.position = view.center - (new Point(350, -75) * Reveal.getScale());
}

// Expose a function to be called when our slide is shown
view.onShow = function() {
  console.log("Showing collision.js");
  Utils.bindMouse(null, null, null, onMouseMove);
  onResize();
}

// Expose a function to be called when our slide is hidden
view.onHide = function() {
  console.log("Hiding collision.js");
}

// Initialize
view.onShow();
