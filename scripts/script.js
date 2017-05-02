/* eslint semi: [0, "never"] */
/* eslint-env browser */

// Instrument holds all the necessary elements and methods needed to activate, record, and save recordings of the instrument
class Instrument {
  // Takes the id of the instrument
  // and queries the container for all necessary elements held within
  constructor (instrumentId) {
    // Get the div of the instrument
    this.container = document.getElementById(instrumentId);
    // Set the id
    this.id = instrumentId;
    // The image that you click to active the instrument
    this.musician = this.container.querySelector('img');
    // Get the keys used to play the instrument
    this.keys = this.container.querySelectorAll('.keys button');
    // Get the audio elements of the instrument
    this.audio = this.container.querySelectorAll('audio');
    // Get the saveButton of the instrument
    this.saveButton = this.container.querySelector('.save-btn');
    // Get the saveText of the instrument
    this.saveText = this.container.querySelector('.save-text');
    // Get the savedData of the instrument
    this.savedData = this.container.querySelector('.saved-data');
    // Set the recordingName which is used to check localStorage
    this.recordingName = this.container.id + 'Recording';
    // Create an empty array to be filled with RecordNodes
    this.recording = [];
    // Used to display a warning message on the save button
    this.isSaveOver = false;
  } // End of constructor

  toggleActive () {
    // If instrument isn't active then add active class
    if (!this.container.classList.contains('active')) {
      // Set the flag used to determine if sounds should play to true
      this.isActive = true;
      this.addActive();
    } else {    // Else remove active from the instrument
      this.removeActive();
      // Set the flag used to determine if sounds should play to false
      this.isActive = false;
    }
    // Get all other instruments
    const others = instruments.filter(instrument => instrument !== this);
    // Remove .active from all other instruments
    others.forEach((instrument) => instrument.removeActive());
  } // End of toggleActive

  // Add .active from the instrument and all its components
  addActive () {
    // Add .active to the container
    this.container.classList.add('active');
    // Listen for instruments keys to be pressed
    this.container.addEventListener('keypress', playSound);
    // Add active to the save button
    this.saveButton.classList.add('active');
    // Add active to the save data
    this.savedData.classList.add('active');
    // Add .active to the key container div
    this.keys[0].parentElement.classList.add('active');
    // Add a click event listener for each key
    this.keys.forEach(key => key.addEventListener('click', playSound));
    // Set all audio elements to preload
    this.audio.forEach((a) => (a.preload = 'auto'));
    // If localStorage is available
    if (checkStorage()) {
      // Refresh the saved data on instrument
      this.refreshSavedData();
    }
  } // End of addActive

  // Removed .active from the instrument and all its components
  removeActive () {
    // Remove active and eventListeners from the container
    this.container.classList.remove('active');
    this.container.removeEventListener('keypress', playSound);

    // Remove .active from saveButton
    this.saveButton.classList.remove('active');
    // Set saveButton text back to default
    this.saveButton.textContent = 'Save';
    // Set the warning flag back to false
    this.isSaveOver = false;
    // Remove .active from the key container
    this.keys[0].parentElement.classList.remove('active');
    // Add event listeners from each key
    this.keys.forEach(key => key.removeEventListener('click', playSound));
    // Remove .active from savedData
    this.savedData.classList.remove('active');
  } // End of removeActive

  // Saves recording data to localStorage
  save () {
    // If localStorage isn't supported stop function now
    if (!checkStorage()) { return };
    // If user is still recording then
    if (isRecording) {
      // Display a message to the user
      this.saveText.innerHTML = 'Finish recording first.';
      addActive(this.saveText);
      return;
    }
    // If recording exists
    if (this.recording.length > 0) {
      // If this is the first click of the save button
      if (!this.isSaveOver && localStorage[this.recordingType] !== undefined) {
        this.isSaveOver = true;
        this.saveButton.textContent = 'Save over?';
        return;
      } else if (this.isSaveOver) {
        this.isSaveOver = false;
        this.saveButton.textContent = 'Save'
      }
      // Save recording as a JSON object in order to parse correctly later
      let recording = '['
      this.recording.forEach(node => {
        recording += `{ "button":"${node.button}" , "timestamp":"${node.timestamp}" , "start":"${node.start}" },`
      });
      recording = recording.substring(0, recording.length - 1);    // Take off last comma so it doesn't effect json.parse
      recording += ' ]';
      localStorage[this.recordingName] = recording;
      // Display save message
      this.saveText.innerHTML = 'Saved.';
      addActive(this.saveText);
      // Refresh saved data so it displays in instrument
      this.refreshSavedData();
    } else {
      // Display save message
      this.saveText.innerHTML = 'You haven\'t recorded anything yet';
      addActive(this.saveText);
    }
  } // End of save

  // Refreshes the savedData of the instrument
  refreshSavedData () {
    // If recording exists
    if (localStorage[this.recordingName]) {
      // Parse recording to JSON
      const recording = JSON.parse(localStorage[this.recordingName]);
      // Get date of recording from JSON
      let date = new Date(parseInt(recording[0].start)).toUTCString();
      // Get first 24 characters of date
      date = date.substring(0, 24);
      // Find saved-data of currentInstrument
      const savedDisplay = this.container.querySelector('.saved-display');
      // If savedDisplay isn't displaying the date already
      if (savedDisplay.innerHTML.indexOf(`<li>${date}</li>`) === -1) {
        // Add saved data to savedDisplay as a date
        savedDisplay.innerHTML = `<li>${date}</li>`;
      }
    }
  } // End of refreshSavedData

  // Clears old recording if it is not saved
  clearRecording () {
    console.log('clearing recording');
    this.recording = [];
  }

  // Saves each event as a recordNode and pushes it to recording
  record (button, timestamp) {
    // Create a RecordNode
    const node = new RecordNode(button.dataset.key, timestamp);
    // Save it in recording
    this.recording.push(node);
  } // End of record

  // Set's a timeout for each node so that it plays at the correct time and plays it
  playRecording () {
    // If recording doesn't exist then return early
    if (!localStorage[this.recordingName]) { return }
    // Parse the localStorage to an object
    const recording = JSON.parse(localStorage[this.recordingName]);
    // Disable the button early
    playButton.disabled = true;
    // Get the last node of the saved recording
    const lastNode = recording[recording.length - 1];
    // Set a timeout for each node of the recording array
    recording.forEach(node => {
      // Get audio element of current node
      let audio = this.container.querySelector(`audio[data-key="${node.button}"]`);
      setTimeout(function () {
        // Disable the button on the beginning of each node -
        // so the button continues to be disabled even if a shorter recording -
        // has ended
        playButton.disabled = true;
        // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
        audio.currentTime = 0;
        // play audio
        audio.play();
        // If this is the last node to play
        if (node === lastNode) {
          // Enable playButton
          playButton.disabled = false;
        }
      }, (node.timestamp - node.start));
    });
  } // End of playRecording

} // End of class Instrument

// RecordNode holds the button and timestamp info
// I'll use this to determine when to play what during playback
class RecordNode {
  constructor (button, timestamp) {
    this.button = button;
    this.timestamp = timestamp;
    this.start = startRecording;
  }
}

// Instruments
const instruments = [
  new Instrument('drums'),
  new Instrument('guitar'),
  new Instrument('bass')
];

// Recording
const recordButton = document.getElementById('record-btn');     // Record Button
const playButton = document.getElementById('play-btn');         // Play Button
let isRecording = false;                                        // Used to stop countdown early if user clicks record again
let startRecording = Date.now();                                // Used to make the beginning of each recording

// Forget
const forgetButton = document.getElementById('forget-btn');          // 'Forget about me' button
let isForget = false;                                                // Used to display a warning message on forgetButton

// Tempo
const tempoSlider = document.getElementById('tempo');                // Tempo slider
const minTempo = 1000;                                               // The largest delay time between metronome interval
let tempo = minTempo - parseInt(tempoSlider.value);                  // The current tempo as displayed on tempoSlider

// ----------------------- Global Functions ----------------------- /*
// Plays the sound connected to the event
function playSound (e) {
  // Find active instrument
  const instrument = instruments.find((inst) => {
    if (inst.container.classList.contains('active')) {
      return inst;
    };
  });
  // If no instruments are active, return early
  if (!instrument) { return }
  // Get button. Adjust the querySelector depending on event type
  let button = (e.type !== 'keypress') ? e.srcElement : instrument.container.querySelector(`button[data-key="${e.keyCode}"]`);
  // Return if button is null
  if (!button) {
    return;
  }
  // Return if buttons parent isn't active
  if (!button.parentElement.classList.contains('active')) {
    return;
  }
  // If isRecording, send button and timestamp data to record()
  if (isRecording) {
    instrument.record(button, Date.now());
  }
  // Get audio with corresponding data-key
  let audio = instrument.container.querySelector(`audio[data-key="${button.dataset.key}"]`);
  // Reset audio.currentTime to 0. This allows us to play sounds without waiting for currently playing sound to end
  audio.currentTime = 0;
  // play audio
  audio.play();
  // add .playing to button
  button.classList.add('playing');
  // remove .playing on transitionend
  button.addEventListener('transitionend', function () {
    button.classList.remove('playing');
  });
} // End of playSound

// Removes .active and transitionend event listeners from the element that is passed in
function removeActive (e) {
  // If e is an element, set element = it. Else, set element = to e.srcElement
  const element = (e.classList) ? e : e.srcElement;
  // Remove active on basic element
  element.classList.remove('active');
  // Remove event listener to prevent event from being fired multiple times
  element.removeEventListener('transitionend', removeActive);
}

// Adds .active and transitionend eventListeners to the element that is passed in
function addActive (e) {
  // If e is an element, set element = it. Else, set element = to e.srcElement
  const element = (e.classList) ? e : e.srcElement;
  // start button transition via css
  element.classList.add('active');
  // listen for button css transition end
  element.addEventListener('transitionend', removeActive);
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

function playMetronome () {
  // While the user isRecording, play the metronome
  const metronomeClick = document.getElementById('metronome-click');
  let metronomeInterval = setInterval(function () {
    metronomeClick.play();
    if (!isRecording) {
      clearInterval(metronomeInterval);
    }
  }, tempo);
}

// ----------------------------- Event Handlers -------------------------
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
  // If user is already recording then remove all classLists and events
  if (isRecording) {
    // Remove active class and reset button text
    recordButton.classList.remove('active');
    recordButton.textContent = 'Record';
    isRecording = false;
    return;
  }
  // Clear all old recordings that aren't saved
  instruments.forEach((instrument) => instrument.clearRecording());
  // Play countdown before recording
  // Get controls div
  let controls = document.querySelector('.controls');
  // Get audio assosciated with controls
  let audio = controls.querySelectorAll('audio');
  // Prime recordButton
  recordButton.classList.add('primed');
  // Counts down from 3
  let i = 3;
  // Counts up from 1
  let audioi = 0;
  // Update recordButton before interval to make click feel more responsive
  recordButton.textContent = i;
  // Pulse button on first countdown
  pulse();
  // Play the first countdown
  audio[0].play();
  let countdown = setInterval(function () {
    i--;
    audioi++;
    if (i > 0) {
      // Pulse button
      pulse();
      // Set text on button
      recordButton.textContent = i;
      // Play countdown audio
      audio[audioi].play();
    } else {
      // Play last countdown
      audio[audio.length - 1].play();
      // If this is the last countdown audio clip, set recordButton to active
      recordButton.classList.remove('primed');
      recordButton.classList.add('active');
      recordButton.textContent = 'Stop';
      // Set startRecording to now
      startRecording = Date.now();
      // Set isRecording to true
      isRecording = true;
      // Play the metronome
      setTimeout(playMetronome(), tempo);
      // Stop countdown
      clearInterval(countdown);
    }
  }, tempo);            // User the tempo slider to determine the countdown speed
}

// Calls playRecording on each instrument
function handlePlayClick () {
  if (checkStorage()) {
    // Play recording in each instrument
    instruments.forEach((instrument) => {
      instrument.playRecording();
    })
  }
}

// Displays warning message on first click
// Removes username and all recordings from localStorage on second click
function handleForgetClick (e) {
  if (isForget) {
    // Remove localStorage of each instrument recordingName
    instruments.forEach((instrument) => localStorage.removeItem(instrument.recordingName));
    // Reload page
    location.reload();
    return;
  }
  if (checkStorage()) {
    // Change text of forgetButton to display a warning message
    e.srcElement.textContent = 'Delete Recordings?';
    // Remove old event listener
    e.srcElement.removeEventListener('click', removeEventListener);
    // Add new event listener
    e.srcElement.addEventListener('click', handleForgetClick);
    // Set isForget flag to true so next time the user clicks forgetButton everything is deleted
    isForget = true;
  }
}

// Set's tempo to whatever the slider is at
function handleTempoChange () {
  tempo = minTempo - parseInt(tempoSlider.value);
}

// Add event listeners for the instruments
instruments.forEach((instrument) => {
  // Activates instrument if its image is clicked
  instrument.musician.addEventListener('click', function () { instrument.toggleActive() });
  // Save data if button is clicked
  instrument.saveButton.addEventListener('click', function () { instrument.save() });
});
// Add event listeners for the app
window.addEventListener('keypress', playSound);                 // Listen for ANY key to be pressed
recordButton.addEventListener('click', handleRecordClick);      // Listen for recordButton
playButton.addEventListener('click', handlePlayClick);          // Listen for playButton
forgetButton.addEventListener('click', handleForgetClick);      // Listen for forgetButton to be clicked
tempoSlider.addEventListener('change', handleTempoChange);      // Listen for tempoSlider changes
