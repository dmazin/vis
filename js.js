//var mic;
//function setup(){
  //mic = new p5.AudioIn()
  //mic.start();
//}
//function draw(){
  //background(0);
  //micLevel = mic.getLevel();
  //ellipse(width/2, constrain(height-micLevel*height*5, 0, height), 10, 10);
//}
//
//
//p5.soundFormats('mp3');
//var soundFile = p5.loadSound('sound.mp3');
var soundLoaded = false;
new p5.SoundFile('sound.mp3', function(soundFile) {
    soundLoaded = true;
    soundFile.loop();
    fft = new p5.FFT(null, 32);
    fft.setInput(soundFile);
    window.soundFile = soundFile;
});


//var mic = new p5.AudioIn()
//mic.start();
//fft.setInput(mic);
//fft.setInput(mic);

var t = THREE;

var clock = new THREE.Clock();

var scene = new t.Scene();
var camera = new t.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new t.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( .5, .5, .5 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true} );


var numBins = 16;

var cubes = [];

for (var i=0; i < numBins; i++) {
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.set(i, 0, 0);
    cubes.push(cube);
}

camera.position.z = 10;
camera.position.x = 7;
//camera.rotation.y = -.3;

var rotation = d3.scale.pow()
    .domain([0, 255])
    .range([.025, .2]);

var normalizedBPM = d3.scale.linear()
    .domain([0, 200])
    .range([0, 1]);

var timeSincePeak = 0;
var peakTimes = [];
var bpm = 80;
function render() {
    requestAnimationFrame( render );

    if (!soundLoaded) {
        return;
    }

    var spectrum = fft.analyze();

    var peakEnergy = fft.getEnergy(100, 250);

    if (peakEnergy < 250) {
        timeSincePeak += clock.getDelta();
    } else if (timeSincePeak > 0) {
        console.log(bpm);
        peakTimes.push(timeSincePeak);
        bpm = 60 / d3.median(peakTimes) / 2;

        for (var i=0; i<cubes.length; i++){
            //console.log(Math.sin(clock.getElapsedTime()));
            cubes[i].rotation.z += .25;
        }
        //camera.rotation.y += .1;
        timeSincePeak = 0;
    }

    //console.log(spectrum[0]);
    //return;
    renderer.render( scene, camera );
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;

    //var micLevel = mic.getLevel(1);
    //micLevel = 1;
    //console.log(micLevel);

    //cube.rotation.x += micLevel;
    //camera.position.z = 100 * micLevel;
    for (var i=0; i<cubes.length; i++){
        //console.log(Math.sin(clock.getElapsedTime()));
        cubes[i].position.y = Math.sin(clock.getElapsedTime()  + i) / 10;
        //cubes[i].position.y = Math.sin(clock.getElapsedTime()  + i) /4 ;
    }
        //console.log(micLevel);

    for (var i=0; i<16; i++) {
        //debugger;
        var amplitude = spectrum[i];
        //console.log(rotation(spectrum[i]));
        //if (amplitude > 0) {
            cubes[i].rotation.x += rotation(spectrum[i]);
        //}
    }
}
render();
