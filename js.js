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
var numBins = 1024;
var lineWidth = 2; // should include margins

var soundLoaded = false;
new p5.SoundFile('sound.mp3', function(soundFile) {
    soundLoaded = true;
    soundFile.loop();
    fft = new p5.FFT(null, numBins); // first arg is smoothing
    fft.setInput(soundFile);
    window.soundFile = soundFile;
});


//var mic = new p5.AudioIn()
//mic.start();
//fft.setInput(mic);
//fft.setInput(mic);
//

var t = THREE;

var clock = new THREE.Clock();

var scene = new t.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.x = 100;
camera.position.y = 100;
camera.position.z = 200;
camera.lookAt(scene.position);


var renderer = new t.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


//camera.position.z = 100;
//camera.rotation.y = 3.14 / 2;
//camera.position.x = 7;

var scaledEnergy = d3.scale.linear()
    .domain([0, 255])
    .range([0, 100]);
    //.range([0, numBins]);

var scaledFrequency = d3.scale.linear()
    .domain([0, 1023])
    .range([0, 150]);

var timeSincePeak = 0;
var peakTimes = [];
var bpm = 80;

var lines = [];
var otherLines = [];
var lastLines = [];

///
				geometry = new THREE.PlaneGeometry(1000, 50);
				material = new THREE.MeshBasicMaterial({color:0x888888});
				mesh = new THREE.Mesh(geometry, material);
				//mesh.rotation.x = -Math.PI/2;
				scene.add(mesh);

				geometry = new THREE.PlaneGeometry(1000, 50);
				material = new THREE.MeshBasicMaterial({color:0x888888});
				mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.z = -Math.PI/2;
				scene.add(mesh);
//
//
//

var renderline = function(points, other, last) {
    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    var geometry = new THREE.Geometry();

    points.forEach(function(energy, frequency) {
        if (other) {
            geometry.vertices.push(
                //new t.Vector3(0, scaledEnergy(energy), scaledFrequency(frequency))
                new t.Vector3(scaledEnergy(energy), 0, scaledFrequency(frequency))
            );
        } else if (last) {
            geometry.vertices.push(
                //new t.Vector3(0, scaledEnergy(energy), scaledFrequency(frequency))
                new t.Vector3(0, scaledEnergy(energy), scaledFrequency(frequency))
            );
        } else {
            geometry.vertices.push(
                //new t.Vector3(0, scaledFrequency(frequency), scaledEnergy(energy))
                new t.Vector3(0, scaledEnergy(energy), scaledFrequency(frequency))
            );
        }
    });

    var line = new THREE.Line( geometry, material );
    lines.push(line);
    scene.add( line );
}

function render() {
    requestAnimationFrame(render);

    if (!soundLoaded) {
        return;
    }

    var spectrum = fft.analyze();
    var scaledSpectrum = spectrum.map(function(amplitude) {
        return scaledEnergy(amplitude);
    });

    lines.forEach(function(line, i) {
        line.position.x -= lineWidth;
        console.log(line.position.x);
    });

    //debugger;

    otherLines.forEach(function(points, i) {
        points.position.x -= lineWidth;
    });

    lastLines.forEach(function(points, i) {
        points.position.y += lineWidth;
    });

    renderline(scaledSpectrum);
    //renderline(scaledSpectrum, true);
    //renderline(scaledSpectrum, null, true);

    renderer.render(scene,camera);
    return;

    var peakEnergy = fft.getEnergy(100, 250);
    if (peakEnergy < 250) {
        timeSincePeak += clock.getDelta();
    } else if (timeSincePeak > 0) {
        peakTimes.push(timeSincePeak);
        bpm = 60 / d3.median(peakTimes) / 2;

        timeSincePeak = 0;
    }

}

render();
