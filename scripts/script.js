// Instruments
const drums = document.getElementById('drums');       // Drums container
const guitar = document.getElementById('guitar');     // Guitar container
const bass = document.getElementById('bass');         // Bass container
const instruments = [drums, guitar, bass];            // Allows me to cycle through instruments to see which one is active
let isActive = false;                                 // Stop playSound from running if there are no active instruments

// Recording
const recordButton = document.getElementById('record-btn');
const playButton = document.getElementById('play-btn');
let isRecording = false;
let startRecording = Date.now();
let drumsRecording = [];
let guitarRecording = [];
let bassRecording = [];

// Welcome
const welcomeScreen = document.getElementById('welcome');             // Welcome screen container
const welcomeMessage = document.getElementById('welcome-message');    // Welcome message
const welcomeButton = document.getElementById('welcome-btn');         // 'Let's Rock!' button
const forgetButton = document.getElementById('forget-btn');1          // 'Forget about me' button

// ----------------------- APP ----------------------- /*
function playSound(e) {

  //Return if there are no active instruments
  if (!isActive) {
    return;
  }
  // Find active instrument
  const instrument = instruments.find((inst) => {
    if (inst.classList.contains('active')) {
      return inst;
    };
  });
  // Get button. Adjust the querySelector depending on event type
  let button = (e.type != 'keypress') ? e.srcElement : instrument.querySelector(`button[data-key="${e.keyCode}"]`);
  //Return if button is null or isn't active
  if (!button) {
    return;
  } else if (!button.parentElement.classList.contains('active')) {
    return;
  }
  // If isRecording, send button and timestamp data to record()
  if (isRecording) {
    record(instrument, button, Date.now());
  }

  // Get audio with corresponding data-key
  let audio = instrument.querySelector(`audio[data-key="${button.dataset.key}"]`)
  // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
  audio.currentTime = 0;
  // play audio
  audio.play();
  // start button transition via css
  button.classList.add('playing');
  //listen for button css transition end
  button.addEventListener('transitionend', removePlaying);
}

function removePlaying(e) {
  // get button element
  const button = e.srcElement;
  // remove playing class from button
  button.classList.remove('playing');
  // remove event listener from button
  button.removeEventListener('transitionend', removePlaying);
}

function toggleActive(e) {
  // get div of character soon to be set to active
  const div = e.srcElement;
  // if div contains .keys return
  if (div.classList.contains('keys')) {
    return;
  }
  // get keys of character soon to be set to active
  const keys = div.querySelector('.keys');
  console.log(keys);
  // toggle active class on or off, add or remove eventListeners
  if (div.classList.contains('active')) {
    isActive = false;
    div.classList.remove('active');
    div.removeEventListener('keypress', playSound);
    // If keys exist remove class and event listener from keys
    if (keys) {
      keys.classList.remove('active');
      keys.removeEventListener('click', playSound);
    }
  } else {
    isActive = true;
    div.classList.add('active');
    div.addEventListener('keypress', playSound);
    // If keys exist add class and event listener from keys
    if (keys) {
      keys.classList.add('active');
      keys.addEventListener('click', playSound);
    }
  }
}

// ---------------------------- RECORDING ------------------------ //
// RecordNode holds the button and timestamp info
// I'll use this to determine when to play what during playback
class recordNode {
  constructor(button, timestamp) {
    this.button = button;
    this.timestamp = timestamp;
  }
}

function record (instrument, button, timestamp) {
  const instrumentId = instrument.id;
  console.log(instrument);
  const node = new recordNode(button, timestamp);

  switch (instrumentId) {
    case 'drums':
      drumsRecording.push(node);
      break;
    case 'guitar':
      guitarRecording.push(node);
      break;
    case 'bass':
      bassRecording.push(node);
      break;
    default:
      console.log('Error: Incorrect instrument was send to record()');
      break;
  }
}

function handleRecordClick () {
  if (isRecording) {
    recordButton.classList.remove('active');
    isRecording = false;
    return;
  }
  recordButton.classList.add('active');
  startRecording = Date.now();
  isRecording = true;
}

function handlePlayClick () {
  console.log('Playing drumsRecording:');
  drumsRecording.forEach(node => {
    setTimeout(function() {
      let audio = drums.querySelector(`audio[data-key="${node.button.dataset.key}"]`)
      // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
      audio.currentTime = 0;
      // play audio
      audio.play();
      // start button transition via css
      node.button.classList.add('playing');
      //listen for button css transition end
      node.button.addEventListener('transitionend', removePlaying);
    }, (node.timestamp - startRecording));
  });
}

// ---------------------------- WELCOME -------------------------- //
function welcome () {
  if (typeof(Storage) !== 'undefined') {
    // If username is already stored
    if (localStorage.username) {
      welcomeScreen.classList.remove('active');                           // Don't display welcome screen
      welcomeMessage.innerHTML = `What's up ${localStorage.username}!`;   // Fill in welcome message
    } else {
      welcomeScreen.classList.add('active');      // Hide welcome screen
      welcomeMessage.innerHTMl = '';              // Remove welcome message
    }
  } else {
    console.log('No storage support!');
  }
}

// Gets username from form and saves it in localStorage.username
function handleWelcomeClick () {
  if (typeof(Storage) !== 'undefined') {
    const username = document.getElementById('username').value;
    localStorage.username = username;
  } else {
    console.log('No storage support!');
  }
}

// Removes username from localStorage
function handleForgetClick () {
  if (typeof(Storage) !== 'undefined') {
    if (!localStorage.username) {
      return;
    }
    localStorage.removeItem('username');
  } else {
    console.log('No storage support!');
  }
}
// App event Listeners
drums.addEventListener('click', toggleActive);    // Listen for drums to be clicked
guitar.addEventListener('click', toggleActive);   // Listen for guitar to be clicked
bass.addEventListener('click', toggleActive);     // Listen for bass to be clicked
window.addEventListener('keypress', playSound);   // Listen for ANY key to be pressed

// Recording event listeners
recordButton.addEventListener('click', handleRecordClick);
playButton.addEventListener('click', handlePlayClick);

// Welcome screen event Listeners
welcomeButton.addEventListener('click', handleWelcomeClick);   // Listen for welcome button to be pressed
forgetButton.addEventListener('click', handleForgetClick);     // Listen for forgetButton to be clicked

window.onload = welcome;
