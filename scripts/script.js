// Set consts
const drummer = document.getElementById('drummer');
const drumKeys = drummer.querySelectorAll('button');
const guitar = document.getElementById('guitar');
const bass = document.getElementById('bass');

// Flags
let isRecording = false;
let isDrums = false;
let isGuitar = false;
let isBass = false;

function playSound(e) {
  // Get button. Adjusted the querySelector depending on event type
  let button = (e.type != 'keypress') ? e.srcElement : document.querySelector(`button[data-key="${e.keyCode}"]`);
  // Get audio with corresponding data-key
  let audio = document.querySelector(`audio[data-key="${button.dataset.key}"]`)
  // FROM THE TOP (reset audio.currentTime to 0. This allows us to play sounds quicker)
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
  console.log('activating');
  // get div of character soon to be set to active
  const div = e.srcElement;
  console.log(div);
  // if div contains .keys return
  if (div.classList.contains('keys')) {
    return;
  }

  // get keys of character soon to be set to active
  const keys = div.querySelector('.keys');
  console.log(keys);
  // toggle active class on or off
  if (div.classList.contains('active')) {
    div.classList.remove('active');
    keys.classList.remove('active');
  } else {
    div.classList.add('active');
    keys.classList.add('active');
  }
}

// Event Listeners
// Drums
drumKeys.forEach(key => key.addEventListener('click', playSound));  // Listen for drumKeys to be pressed
drummer.addEventListener('click', toggleActive);  // Listen for drummer to be clicked

// Guitar

// Bass

// Listen for any key press
window.addEventListener('keypress', playSound);
