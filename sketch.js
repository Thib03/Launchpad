var black = 0;
var grey  = 127;
var white = 255;

var dimension;
var weight = 0.005;
var bigRadius = 0.35;
var littleRadius = 0.0905;
var marge = 0.06;

var velocity = [];
for(let n = 0; n < 7; n++) {
  velocity.push(0);
}

var number = [];
for(let n = 0; n < 75; n++) {
  number.push(0);
}

var notesOn = [];
for(let n = 0; n < 7; n++) {
  notesOn.push([]);
}

var lightGrid = [];

function pad(row,col) {
  return lightGrid[row*8+col];
}

var millisecond = 0;
var notePressed = -1;

var midiButton;
var midi = 0;
var midiRadius = 0.35*littleRadius;

var midiInput, midiOutput;

var launchpad;

var noteOnStatus     = 144;
var noteOffStatus    = 128;
var aftertouchStatus = 160;

var synth;

let t1 = 0.001;
let l1 = 1; // velocity
let t2 = 0.1;
let l2 = 0.5; // aftertouch
let t3 = 0.3;
let l3 = 0;

var fonDeg = 0;
//var fonNum = 130;
var nextNote = false;

var dragX, dragY, dragDist;
var dragLimit = 0.1;

function degToNdt(d) {
  switch(d) {
    default:
    case 1: return 0;
    case 2: return 2;
    case 3:	return 4;
    case 4: return 5;
    case 5: return 7;
    case 6: return 9;
		case 7: return 11;
  }
}

function ndtToDeg(n) {
  switch(n){
    case 0: return 1;
    case 2: return 2;
    case 4: return 3;
    case 5: return 4;
    case 7: return 5;
    case 9: return 6;
    case 11:return 7;
    default: return false;
  }
}

function degToColor(d,light=false) {
  if(light) {
    switch(d) {
      case 1:  return 41;
      case 3:  return 25;
      case 5:  return 60;
      case 7:  return 13;
      default: return 0;//70;
    }
  }
  switch(d) {
    case 1:  return [109,158,235];
    case 3:  return [146,196,125];
    case 5:  return [224,102,101];
    case 7:  return [254,217,102];
    default: return [217,217,217];
  }
}

function numberToColor(num) {
  switch(num) {
    case 41:  return [109,158,235];
    case 25:  return [146,196,125];
    case 60:  return [224,102,101];
    case 13:  return [254,217,102];
    case 3:  return white;
    default:  return [217,217,217];
  }
}

class Pad {
  constructor(row,col) {
    this.row = row;
    this.col = col;

    this.press = false;

    this.button = new Clickable();
    this.button.stroke = black;
    this.button.text = '';
    this.button.strokeWeight = 0;

    this.button.color = grey;

    var row = this.row;
    var col = this.col;

    this.button.onPress = function() {
      pad(row,col).press = true;
      if(midi) {
        midiOutput.send(noteOnStatus,[(row+1)*10+col+1,120]);
      }
    }

    this.button.onRelease = function() {
      pad(row,col).press = false;
      if(midi) {
        midiOutput.send(noteOffStatus,[(row+1)*10+col+1,0]);
      }
    }

    this.button.onOutside = function() {
      var thisPad = pad(row,col);
      if(thisPad.press) {
        thisPad.press = false;
        if(midi) {
          midiOutput.send(noteOnStatus,[(row+1)*10+col+1,0]);
        }
      }
    }

    this.update();
  }

  switch(on) {
    this.button.stroke = on?dimension/10:0;
  }

  midiNumber(octave) {

  }

  setColor(num) {
    this.button.color = numberToColor(num);
  }

  update() {
    let l = dimension/8;
    this.button.resize((1-2*marge)*l,(1-2*marge)*l);
    this.button.locate(width/2 -dimension/2+(this.col+marge)*l,
                       height/2+dimension/2-(this.row+1-marge)*l);
    this.button.cornerRadius = dimension/80;
  }

  draw() {
    this.button.draw();
  }
}

function initMidiButton() {
  midiButton = new Clickable();
  midiButton.color = black;
  midiButton.cornerRadius = 1000;
  midiButton.stroke = black;
  midiButton.text = '';
  midiButton.onPress = function() {
    //if(this.color == white) {
      enableMidi();
    /*}
    else {
      disableMidi();
    }*/
  }
  updateMidiButton();
}

function updateMidiButton() {
  let r = midiRadius*dimension;
  midiButton.resize(2*r,2*r);
  midiButton.locate(width/2 -r,
                     height/2-r);
  midiButton.strokeWeight = 0;
}

function drawMidiButton() {
  midiButton.draw();

  noStroke();
  fill(grey);
  let r  = 0.14*midiRadius*dimension;
  let br = 0.6*midiRadius*dimension;
  for(let n = 0; n < 5; n++) {
    let a = n*PI/4;
    circle(width/2+br*cos(a),height/2-br*sin(a),2*r,2*r);
  }
  let l = 0.7*midiRadius*dimension;
  let h = 0.35*midiRadius*dimension;
  rect(width/2-l/2,height/2+1.1*br,l,h,h);

  noFill();
  stroke(black);
  strokeWeight(1.3*weight*dimension);
  r = midiRadius*dimension;
  circle(width/2,height/2,2*r);
}

function preload() {
  font = loadFont('nunito.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  dimension = Math.min(width,height)*(1 - marge/4);

  for(var row = 0; row < 8; row++) {
    for(var col = 0; col < 8; col++) {
      lightGrid.push(new Pad(row,col));
    }
  }

  initMidiButton();

  userStartAudio().then(function() {
     console.log('Audio ready');
   });
}

function draw() {
  background(black);

  noStroke();

  for(var row = 0; row < 8; row++) {
    for(var col = 0; col < 8; col++) {
      lightGrid[row*8+col].draw();
    }
  }

  if(!midi) {
    drawMidiButton();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  dimension = Math.min(width,height)*(1 - marge/4);

  for(var row = 0; row < 8; row++) {
    for(var col = 0; col < 8; col++) {
      lightGrid[row*8+col].update();
    }
  }

  updateMidiButton();
}

//------------------------------------------------------------------------------
//                             MIDI
//------------------------------------------------------------------------------

function enableMidi() {
  WebMidi.enable(function (err) {
    if (err) console.log("An error occurred", err);

    //--------------------OUTPUT--------------------

    var liste = '';
    var taille = WebMidi.outputs.length;
    var i, num;
    var numStr = '0';

    if(taille == 0) {
      window.alert("No MIDI output device detected. MIDI disabled.");
      disableMidi();
      return;
    }

    for(let i = 0; i < taille; i++) {
      num = i+1;
      liste += '   ' + num.toString() + '   -   ' + WebMidi.outputs[i].name + '\n';
    }

    i = 0;
    num = 0;

    while((num < 1 || num > taille) && i < 1) {
      numStr = window.prompt("Write the number of the desired MIDI output device:\n\n"+liste+"\nCancel this pop-up to use the integrated synth.");
      if(numStr == null)
      {
        num = 0;
        break;
      }
      else if(numStr) num = parseInt(numStr);
      i++;
    }

    if(num < 0 || !num || num > taille) {
      window.alert("No MIDI output selected. A sinewave polyphonic synth will be used as output.");
      synth = new PolySynth(6);
      disableMidi();
      return;
    }
    else {
      midiOutput = WebMidi.outputs[num-1];
      window.alert('Output selected: ' + midiOutput.name + '.');
      midi = 1;
    }

    //---------------------INPUT--------------------

    liste = '';
    taille = WebMidi.inputs.length;
    numStr = '0';

    if(taille == 0) {
      window.alert("No MIDI input device detected.");
      return;
    }

    for(let i = 0; i < taille; i++) {
      num = i+1;
      liste += '   ' + num.toString() + '   -   ' + WebMidi.inputs[i].name + '\n';
    }

    i = 0;
    num = 0;

    while((num < 1 || num > taille) && i < 1) {
      numStr = window.prompt("Write the number of the desired MIDI input device:\n\n"+liste);
      if(numStr == null)
      {
        num = 0;
        break;
      }
      else if(numStr) num = parseInt(numStr);
      i++;
    }

    if(num < 0 || !num || num > taille) {
      window.alert("No MIDI input selected.");
      return;
    }
    else {
      midiInput = WebMidi.inputs[num-1];
      let name = midiInput.name;
      window.alert('Input selected: ' + name + '.');
      if(!midiInput.hasListener('noteon',      'all', handleNote)) {
        midiInput.addListener('noteon',        'all', handleNote);
        midiInput.addListener('noteoff',       'all', handleNote);
      }
      midi = 2;
    }
  },true);
}

//--------------------EVENTS--------------------

function handleNote(e) {
  var num = e.note.number;
  let row = Math.floor(num/10)-1;
  let col = num%10-1;
  if(row < 0 || row > 7 || col < 0 || col > 7) {
    return;
  }
  pad(row,col).setColor(e.rawVelocity);
  /*if(e.rawVelocity == 3) {
    pad(row,col).button.text = 'here';
  }
  else {
    pad(row,col).button.text = '';
  }*/
}

function disableMidi() {
  midi = 0;

  for(let i = 0; i < WebMidi.inputs.length; i++) {
    WebMidi.inputs[i].removeListener();
  }

  WebMidi.disable();

  //midiButton.color  = white;
  //midiButton.stroke = black;
}
