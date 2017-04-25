// Instruments
const drums = document.getElementById('drums');       // Drums container
const drummer = drums.querySelector('img');           // Drummer image
const guitar = document.getElementById('guitar');     // Guitar container
const guitarist = guitar.querySelector('img');        // Guitarist image
const bass = document.getElementById('bass');         // Bass container
const bassist = bass.querySelector('img');            // Bassist image
const instruments = [drums, guitar, bass];            // Allows me to cycle through instruments to see which one is active
let isActive = false;                                 // Stop playSound from running if there are no active instruments

// Recording
const recordButton = document.getElementById('record-btn');
const playButton = document.getElementById('play-btn');
const saveButtons = document.querySelectorAll('.save-btn');
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
  button.classList.add('active');
  //listen for button css transition end
  button.addEventListener('transitionend', removeActive);
}

function removeActive(e) {
  // get elements element
  const element = e.srcElement;
  // remove playing class from button
  element.classList.remove('active');
  // remove event listener from button
  element.removeEventListener('transitionend', removeActive);
}

function toggleActive(e) {
  // get div of character soon to be set to active
  const div = e.srcElement.parentElement;
  // if div contains .keys return
  if (div.classList.contains('keys')) {
    return;
  }
  // Get keys of div
  const keys = div.querySelector('.keys');
  // Get saveButton of div
  const saveButton = div.querySelector('.save-btn');
  // Get saveText of div
  const saveText = div.querySelector('.save-text');
  // toggle active class on or off, add or remove eventListeners
  if (div.classList.contains('active')) {
    isActive = false;
    div.classList.remove('active');
    div.removeEventListener('keypress', playSound);
    saveButton.classList.remove('active');
    // If keys exist remove class and event listener from keys
    if (keys) {
      keys.classList.remove('active');
      keys.removeEventListener('click', playSound);
    }
  } else {
    isActive = true;
    div.classList.add('active');
    div.addEventListener('keypress', playSound);
    saveButton.classList.add('active');
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
    this.start = startRecording;
  }
}

// Saves each event as a recordNode and pushes it to the apporpriate recording array
function record (instrument, button, timestamp) {
  const instrumentId = instrument.id;
  const node = new recordNode(button.dataset.key, timestamp);

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
      console.log('Error: Incorrect instrument was sent to record()');
      break;
  }
}

// Toggles isRecording and active class on button
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

// Check's if anything is stored in localStorage and plays it if it is.
function handlePlayClick (e) {
  if (typeof(Storage) !== 'undefined') {                        // If localStorage is accessable
    if (localStorage.drumsRecording) {                          // If there is a recording saved in localStorage
      playRecording(JSON.parse(localStorage.drumsRecording));   // Parse the storage and send it to playRecording
    }
    else if (drumsRecording.length > 0) {
      playRecording(drumsRecording);
    }
  } else {
    console.log('Storage not supported');
  }
}

// Set's a timeout for each node so that it plays at the correct time and plays it
function playRecording (recording) {
  recording.forEach(node => {
    setTimeout(function() {
      let audio = drums.querySelector(`audio[data-key="${node.button}"]`)
      // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
      audio.currentTime = 0;
      // play audio
      audio.play();
    }, (node.timestamp - node.start));
  });
}

function handleSaveClick (e) {
  console.log('Saving ' + e.srcElement.parentElement);
  const saveText = e.srcElement.parentElement.querySelector('.save-text');
  if (drumsRecording.length > 0) {
    console.log(drumsRecording);
    if (typeof(Storage) !== 'undefined') {

      //Save recording as a JSON object in order to parse correctly later
      let recording = '['
      drumsRecording.forEach(node => {
        recording += `{ "button":"${node.button}" , "timestamp":"${node.timestamp}" , "start":"${node.start}" },`
      });
      recording = recording.substring(0, recording.length - 1);    // Take off last comma so it doesn't effect json.parse
      recording += ' ]';
      localStorage.drumsRecording = recording;
      console.log(localStorage.drumsRecording);

      saveText.innerHtml = 'Saved.';
      saveText.classList.add('active');
      saveText.addEventListener('transitionend', removeActive);
    } else {
      console.log('Storage isn\'t supported');
    }
  } else {
    saveText.innerHTML = 'You haven\'t recorded anything yet';
    saveText.classList.add('active');
    saveText.addEventListener('transitionend', removeActive);
  }
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
    localStorage.removeItem('drumsRecording');
  } else {
    console.log('No storage support!');
  }
}
// App event Listeners
drummer.addEventListener('click', toggleActive);    // Listen for drums to be clicked
guitarist.addEventListener('click', toggleActive);   // Listen for guitar to be clicked
bassist.addEventListener('click', toggleActive);     // Listen for bass to be clicked
window.addEventListener('keypress', playSound);   // Listen for ANY key to be pressed

// Recording event listeners
recordButton.addEventListener('click', handleRecordClick);
playButton.addEventListener('click', handlePlayClick);
saveButtons.forEach(button => button.addEventListener('click', handleSaveClick));

// Welcome screen event Listeners
welcomeButton.addEventListener('click', handleWelcomeClick);   // Listen for welcome button to be pressed
forgetButton.addEventListener('click', handleForgetClick);     // Listen for forgetButton to be clicked

window.onload = welcome;
