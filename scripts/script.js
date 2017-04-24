// Set consts
const drummer = document.getElementById('drummer');
const guitar = document.getElementById('guitar');
const bass = document.getElementById('bass');

// Flags
let isRecording = false;

function playSound(e) {
  console.log('playSound');
  // Get button. Adjusted the querySelector depending on event type
  let button = (e.type != 'keypress') ? e.srcElement : document.querySelector(`button[data-key="${e.keyCode}"]`);

  //Return if button is null or isn't active
  if (!button) {
    return;
    if (!button.classList.contains('active')) return;
  }
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
  // get div of character soon to be set to active
  const div = e.srcElement;
  // if div contains .keys return
  if (div.classList.contains('keys')) {
    return;
  }
  // get keys of character soon to be set to active
  const keys = div.querySelector('.keys');
  // toggle active class on or off, add or remove eventListeners
  if (div.classList.contains('active')) {
    div.classList.remove('active');
    keys.classList.remove('active');
    keys.removeEventListener('click', playSound);
    div.removeEventListener('keypress', playSound);
  } else {
    div.classList.add('active');
    keys.classList.add('active');
    keys.addEventListener('click', playSound);
    div.addEventListener('keypress', playSound);
  }
}

// Event Listeners
// Drums
drummer.addEventListener('click', toggleActive);  // Listen for drummer to be clicked

// Guitar

// Bass
window.addEventListener('keypress', playSound);
