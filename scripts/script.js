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

// Forget
const forgetButton = document.getElementById('forget-btn');          // 'Forget about me' button
let isForget = false;
let isSaveOver = false;

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
  // add .playing to button
  button.classList.add('playing');
  button.addEventListener('transitionend', function () {
    button.classList.remove('playing');
  });
}

function removeActive (element) {
  // Check if object passed in is an instrument
  if (element.id === 'drums' || element.id === 'guitar' || element.id === 'bass') {
    // Get keys of element
    const keys = element.querySelectorAll('.keys button');
    // Get saveButton of element
    const saveButton = element.querySelector('.save-btn');
    // Get saveData of element
    const savedData = element.querySelector('.saved-data');
    // Instrument active removal
    // Remove .actives and eventListeners
    element.classList.remove('active');
    element.removeEventListener('keypress', playSound);
    // If save button exist remove class from it
    if (saveButton) {
      saveButton.classList.remove('active');
      saveButton.textContent = 'Save';
      isSaveOver = false;
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

function addActive (element) {
  // If element is an instrument
  if (element.id === 'drums' || element.id === 'guitar' || element.id === 'bass') {
    // Get keys of element
    const keys = element.querySelectorAll('.keys button');
    // Get audio elements
    const audio = element.querySelectorAll('audio');
    // Get saveButton of element
    const saveButton = element.querySelector('.save-btn');
    // Get saveData of element
    const savedData = element.querySelector('.saved-data');
    // Add active
    element.classList.add('active');
    element.addEventListener('keypress', playSound);
    saveButton.classList.add('active');
    savedData.classList.add('active');
    // If keys exist add class and event listener from keys
    if (keys) {
      keys[0].parentElement.classList.add('active');
      keys.forEach(key => key.addEventListener('click', playSound));
    }
    // Set all audio keys to preload
    audio.forEach((a) => (a.preload = 'auto'));
    if (checkStorage()) {
      // Cycle through all instruments
      instruments.forEach((instrument) => {
        refreshSavedData(instrument);
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
  // If element isn't active then add active class
  if (!element.classList.contains('active')) {
    isActive = true;
    addActive(element);
  } else {    // Else remove active from element
    removeActive(element);
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

// Adds recording of instrument to saved-data ul
function refreshSavedData (instrument) {
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
  // If recording exists
  if (localStorage[recordingName]) {
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
      savedDisplay.innerHTML = `<li>${date}</li>`;
    }
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
  if (recordButton.classList.contains('primed')) { return; }
  // Makes record button pulse
  function pulse () {
    recordButton.classList.add('pulse');
    recordButton.addEventListener('transitionend', function () {
      recordButton.classList.remove('pulse');
    });
  }
  // If record-btn is primed or pulsed remove classes and return
  if (recordButton.classList.contains('primed')) {
    recordButton.classList.remove('primed');
    if (recordButton.classList.contains('pulse')) {
      recordButton.classList.remove('pulse');
      recordButton.removeEventListener('transitionend', function () {
        recordButton.classList.remove('pulse');
      });
    }
    return;
  }
  // If isRecording then remove all classLists and events
  if (isRecording) {
    // Remove active class and reset button text
    recordButton.classList.remove('active');
    recordButton.textContent = 'Record';
    isRecording = false;
    return;
  }
  // Plays countdown before recording
  recordButton.classList.add('primed');
  // Counts down from 3
  let i = 3;
  // Update recordButton before interval to make click feel more responsive
  recordButton.textContent = i;
  // Pulse button on first countdown
  pulse();
  let countdown = setInterval(function () {
    i--;
    if (i > 0) {
      // Pulse button
      pulse();
      recordButton.textContent = i;
    } else {
      // If i is 0, set record to active
      recordButton.classList.remove('primed');
      recordButton.classList.add('active');
      recordButton.textContent = 'Stop';
      startRecording = Date.now();
      isRecording = true;
      clearInterval(countdown);
    }
  }, 700);
}

// Check's if anything is stored in localStorage and plays it if it is.
function handlePlayClick () {
  if (checkStorage()) {                        // If localStorage is accessable
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
  // If localStorage isn't supported stop function now
  if (!checkStorage()) { return };

  const instrument = e.srcElement.parentElement.parentElement;
  const saveText = instrument.querySelector('.save-text');
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

  // If recording exists
  if (recordingType.length > 0) {
    // If this is the first click of the save button
    if (!isSaveOver && localStorage[localStorageType] !== undefined) {
      isSaveOver = true;
      e.srcElement.textContent = 'Save over?';
      return;
    } else if (isSaveOver) {
      isSaveOver = false;
      e.srcElement.textContent = 'Save'
    }

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
    // Refresh saved data so it displays in instrument
    refreshSavedData(instrument);
  } else {
    // Display save message
    saveText.innerHTML = 'You haven\'t recorded anything yet';
    saveText.classList.add('active');
    saveText.addEventListener('transitionend', removeActive);
  }
}

// Displays warning message if isForget is false
// Removes username and all recordings from localStorage if isForget is true
function handleForgetClick (e) {
  if (isForget) {
    localStorage.removeItem('drumsRecording');
    localStorage.removeItem('guitarRecording');
    localStorage.removeItem('bassRecording');
    return;
  }
  if (checkStorage()) {
    // Change text of forgetButton to display a warning message
    e.srcElement.textContent = 'Delete Recordings?';
    // Remove old event listener
    e.srcElement.removeEventListener('click', removeEventListener);
    // Add new event listener
    e.srcElement.addEventListener('click', forgetData);
  }
}

// Deletes localStorage data and refreshes page
function forgetData () {
  localStorage.removeItem('username');
  localStorage.removeItem('drumsRecording');
  localStorage.removeItem('guitarRecording');
  localStorage.removeItem('bassRecording');
  location.reload();
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

// Forget button event listeners
forgetButton.addEventListener('click', handleForgetClick);     // Listen for forgetButton to be clicked
