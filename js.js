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
//
var cubeWidth = .5;

var t = THREE;

var clock = new THREE.Clock();

var scene = new t.Scene();
var camera = new t.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new t.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( .5, .5, .5 );


var numBins = 16;


var insertCubes = function(xPosition) {
    var material = new THREE.MeshBasicMaterial( { color: '#'+Math.floor(Math.random()*16777215).toString(16), wireframe: true} );
    var cubes = [];
    for (var i=0; i < numBins; i++) {
        var cube = new THREE.Mesh( geometry, material );
        scene.add(cube);
        cube.position.set(i, xPosition, 0);
        cubes.push(cube);
    }
    return cubes;
}

camera.position.z = 10;
camera.position.x = 7;
camera.rotation.z = 3.14  / 2;

var rotation = d3.scale.linear()
    .domain([0, 255])
    .range([0, .2]);

var normalizedBPM = d3.scale.linear()
    .domain([0, 200])
    .range([0, 1]);

var timeSincePeak = 0;
var peakTimes = [];
var bpm = 80;

var cubesList = [];
var rotationsList = [];

function render() {
    requestAnimationFrame(render);

    if (!soundLoaded) {
        return;
    }

    var spectrum = fft.analyze();

    var peakEnergy = fft.getEnergy(100, 250);
    if (peakEnergy < 250) {
        timeSincePeak += clock.getDelta();
    } else if (timeSincePeak > 0) {
        cubesList.forEach(function(cubes) {
            shiftCubes(cubes);
        });

        cubesList.push(insertCubes(10));

        var spectrumSlice = spectrum.slice(0, 16);
        var rotations = spectrumSlice.map(function(amplitude) {
            return rotation(amplitude);
        });
        rotationsList.push(rotations);

        peakTimes.push(timeSincePeak);
        bpm = 60 / d3.median(peakTimes) / 2;

        timeSincePeak = 0;
    }

    cubesList.forEach(function(cubes, i) {
        cubes.forEach(function(cube, j) {
            cube.rotation.x += rotationsList[i][j];
            cube.rotation.y += 3.14 / 100;
        });
    });

    //console.log(spectrum[0]);
    //return;
    //cube.rotation.x += 0.1;
    //cube.rotation.y += 0.1;

    //var micLevel = mic.getLevel(1);
    //micLevel = 1;
    //console.log(micLevel);

    //cube.rotation.x += micLevel;
    //camera.position.z = 100 * micLevel;
    //for (var i=0; i<cubes.length; i++){
        //console.log(Math.sin(clock.getElapsedTime()));
        //cubes[i].position.y = Math.sin(clock.getElapsedTime()  + i) / 10;
        //cubes[i].position.y = Math.sin(clock.getElapsedTime()  + i) /4 ;
    //}
        //console.log(micLevel);
        //

    //for (var i=0; i<numBins; i++) {
        //// Rotation for lower frequencies is boring
        //cubes[i].rotation.x += rotation(spectrum[i]);
    //}

    renderer.render(scene,camera);
}

render();

var shiftCubes = function(cubes) {
    for (var i=0; i<cubes.length; i++){
        cubes[i].position.y -= cubeWidth + 1;
    }
}
