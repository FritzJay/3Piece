// Set consts
const drums = document.getElementById('drums');
const drumKeys = drums.querySelectorAll('button');
const guitar = document.getElementById('guitar');
const bass = document.getElementById('bass');

function playSound(e) {
  // Get button. Adjusted the querySelector depending on event type
  let button = (e.type != 'keypress') ? e.srcElement : document.querySelector(`button[data-key="${e.keyCode}"]`);
  // Get audio with corresponding data-key
  let audio = document.querySelector(`audio[data-key="${button.dataset.key}"]`)
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

// Add event listeners
//Drums
drumKeys.forEach(key => key.addEventListener('click', playSound));

//Listen for any key press
window.addEventListener('keypress', playSound);
