/* eslint semi: [0, "never"] */
/* eslint-env browser */

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
const forgetButton = document.getElementById('forget-btn');          // 'Forget about me' button

// ----------------------- APP ----------------------- /*
function playSound (e) {
  // Return if there are no active instruments
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
  let button = (e.type !== 'keypress') ? e.srcElement : instrument.querySelector(`button[data-key="${e.keyCode}"]`);
  // Return if button is null
  if (!button) {
    return;
  }
  // Return if buttons parent is active
  if (!button.parentElement.classList.contains('active')) {
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
  // add .active to button
  addActive(button);
}

function removeActive (element, keys, saveButton, saveText, savedData) {
  // Check if object passed in is an instrument
  if (element.id === 'drums' || element.id === 'guitar' || element.id === 'bass') {
    // Instrument active removal
    // Remove .actives and eventListeners
    element.classList.remove('active');
    element.removeEventListener('keypress', playSound);
    // If save button exist remove class from it
    if (saveButton) {
      saveButton.classList.remove('active');
    }
    // If keys exist remove class and event listener from keys
    if (keys) {
      keys[0].parentElement.classList.remove('active');
      keys.forEach(key => key.removeEventListener('click', playSound));
    }
    // Remove save-data active
    if (savedData) {
      savedData.classList.remove('active');
    }
  } else {
    // Set element to the events srcElement
    element = element.srcElement;
    // Remove active on basic element
    element.classList.remove('active');
    // Remove event listener to prevent event from being fired multiple times
    element.removeEventListener('transitionend', removeActive);
  }
}

function addActive (element, keys, saveButton, saveText, savedData) {
  // If element is an instrument
  if (element.id === 'drums' || element.id === 'guitar' || element.id === 'bass') {
    element.classList.add('active');
    element.addEventListener('keypress', playSound);
    saveButton.classList.add('active');
    savedData.classList.add('active');
    // If keys exist add class and event listener from keys
    if (keys) {
      keys[0].parentElement.classList.add('active');
      keys.forEach(key => key.addEventListener('click', playSound));
    }
    if (checkStorage) {
      // Cycle through all instruments
      instruments.forEach((instrument) => {
        let recordingName = '';
        switch (instrument.id) {
          case 'drums':
            recordingName = 'drumsRecording';
            break;
          case 'guitar':
            recordingName = 'guitarRecording';
            break;
          case 'bass':
            recordingName = 'bassRecording';
            break;
          default:
            console.log('Incorrect instrument in "instruments"');
            break;
        }
        console.log(recordingName);
        // If recording exists
        if (localStorage[recordingName]) {
          console.log(localStorage[recordingName]);
          // Parse recording to JSON
          const recording = JSON.parse(localStorage[recordingName]);
          // Get date of recording from JSON
          let date = new Date(parseInt(recording[0].start)).toUTCString();
          // Get first 24 characters of date
          date = date.substring(0, 24);
          // Find saved-data of currentInstrument
          const savedDisplay = instrument.querySelector('.saved-display');
          // If savedDisplay isn't displaying the date already
          if (savedDisplay.innerHTML.indexOf(`<li>${date}</li>`) === -1) {
            // Add saved data to savedDisplay as a date
            savedDisplay.innerHTML += `<li>${date}</li>`;
          }
        }
      });
    }
  } else {
    console.log(element);
    // start button transition via css
    element.classList.add('active');
    // listen for button css transition end
    element.addEventListener('transitionend', removeActive);
  }
}

function toggleActive (e) {
  // get div of instrument soon to be set to active
  const element = e.srcElement.parentElement;
  // Get keys of element
  const keys = element.querySelectorAll('.keys button');
  // Get saveButton of element
  const saveButton = element.querySelector('.save-btn');
  // Get saveText of element
  const saveText = element.querySelector('.save-text');
  // Get saveData of element
  const savedData = element.querySelector('.saved-data');

  // If element isn't active then add active class
  if (!element.classList.contains('active')) {
    isActive = true;
    addActive(element, keys, saveButton, saveText, savedData);
  } else {    // Else remove active from element
    removeActive(element, keys, saveButton, saveText, savedData);
    isActive = false;
  }
  // Remove .active from all other instruments
  const others = instruments.filter(instrument => instrument.id !== element.id);
  others.forEach(instrument => {
    const otherKeys = instrument.querySelectorAll('.keys button');
    const otherSaveButton = instrument.querySelector('.save-btn');
    const otherSaveText = instrument.querySelector('.save-text');
    const otherSavedData = instrument.querySelector('.saved-data');
    removeActive(instrument, otherKeys, otherSaveButton, otherSaveText, otherSavedData);
  });
}

// Checks if localStorage is available and console.logs and error if it's not
function checkStorage () {
  if (typeof (Storage) !== 'undefined') {
    return true;
  } else {
    console.log('Local Storage is not supported.');
    return false;
  }
}

// ---------------------------- RECORDING ------------------------ //
// RecordNode holds the button and timestamp info
// I'll use this to determine when to play what during playback
class RecordNode {
  constructor (button, timestamp) {
    this.button = button;
    this.timestamp = timestamp;
    this.start = startRecording;
  }
}

// Saves each event as a recordNode and pushes it to the apporpriate recording array
function record (instrument, button, timestamp) {
  const instrumentId = instrument.id;
  const node = new RecordNode(button.dataset.key, timestamp);

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
function handlePlayClick () {
  if (typeof (Storage) !== 'undefined') {                        // If localStorage is accessable
    // Check for Drums
    if (localStorage.drumsRecording) {                          // If there is a recording saved in localStorage
      playRecording(JSON.parse(localStorage.drumsRecording), 'drums');   // Parse the storage and send it to playRecording
    } else if (drumsRecording.length > 0) {
      playRecording(drumsRecording, 'drums');                            // If there is a recording in memory play that
    }

    // Check for guitar
    if (localStorage.guitarRecording) {                          // If there is a recording saved in localStorage
      playRecording(JSON.parse(localStorage.guitarRecording), 'guitar');   // Parse the storage and send it to playRecording
    } else if (guitarRecording.length > 0) {
      playRecording(guitarRecording, 'guitar');                            // If there is a recording in memory play that
    }

    // Check for bass
    if (localStorage.bassRecording) {                          // If there is a recording saved in localStorage
      playRecording(JSON.parse(localStorage.bassRecording), 'bass');   // Parse the storage and send it to playRecording
    } else if (bassRecording.length > 0) {
      playRecording(guitarRecording, 'bass');                            // If there is a recording in memory play that
    }
  } else {
    console.log('Storage not supported');
  }
}

// Set's a timeout for each node so that it plays at the correct time and plays it
function playRecording (recording, type) {
  // Get the element of the instrument to be played
  let element = document.getElementById(type);
  // Set a timeout for each node of the recording array
  recording.forEach(node => {
    setTimeout(function () {
      let audio = element.querySelector(`audio[data-key="${node.button}"]`)
      // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
      audio.currentTime = 0;
      // play audio
      audio.play();
    }, (node.timestamp - node.start));
  });
}

function handleSaveClick (e) {
  const saveText = e.srcElement.parentElement.querySelector('.save-text');
  let recordingType;
  let localStorageType;
  // Get recording type
  switch (e.srcElement.parentElement.parentElement.id) {
    case 'drums':
      recordingType = drumsRecording;
      localStorageType = 'drumsRecording';
      break;
    case 'guitar':
      recordingType = guitarRecording;
      localStorageType = 'guitarRecording';
      break;
    case 'bass':
      recordingType = bassRecording;
      localStorageType = 'bassRecording';
      break;
    default:
      console.log('Error: Incorrect recording type in handleSaveClick');
      break;
  }

  // If recording exists, save it to localStorage as JSON
  if (recordingType.length > 0) {
    if (typeof (Storage) !== 'undefined') {
      // Save recording as a JSON object in order to parse correctly later
      let recording = '['
      recordingType.forEach(node => {
        recording += `{ "button":"${node.button}" , "timestamp":"${node.timestamp}" , "start":"${node.start}" },`
      });
      recording = recording.substring(0, recording.length - 1);    // Take off last comma so it doesn't effect json.parse
      recording += ' ]';
      localStorage[localStorageType] = recording;

      // Display save message
      saveText.innerHtml = 'Saved.';
      saveText.classList.add('active');
      saveText.addEventListener('transitionend', removeActive);
    } else {
      console.log('Storage isn\'t supported');
    }
  } else {
    // Display save message
    saveText.innerHTML = 'You haven\'t recorded anything yet';
    saveText.classList.add('active');
    saveText.addEventListener('transitionend', removeActive);
  }
}

// Removes username and all recordings from localStorage
function handleForgetClick () {
  if (typeof (Storage) !== 'undefined') {
    if (!localStorage.username) {
      return;
    }
    localStorage.removeItem('username');
    localStorage.removeItem('drumsRecording');
    localStorage.removeItem('guitarRecording');
    localStorage.removeItem('bassRecording');
  } else {
    console.log('No storage support!');
  }
}

// ---------------------------- WELCOME -------------------------- //

function welcome () {
  if (typeof (Storage) !== 'undefined') {
    // If username is already stored
    if (localStorage.username) {
      welcomeScreen.classList.remove('active');                           // Don't display welcome screen
      welcomeMessage.innerHTML = `What's up <span="name">${localStorage.username}</span>!`;   // Fill in welcome message
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
  if (typeof (Storage) !== 'undefined') {
    const username = document.getElementById('username').value;
    localStorage.username = username;
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
