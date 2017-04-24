// Set consts
const drums = document.getElementById('drums');
const drumKeys = drums.querySelectorAll('button');
const guitar = document.getElementById('guitar');
const bass = document.getElementById('bass');

//Create functions
function playSound(e) {
  console.log(e);
  // Get audio with corresponding data-key
  const audio = document.querySelector(`audio[data-key="${e.srcElement.dataset.key}"]`);
  console.log(audio);
  // play audio
  // start button transition
}

function removeTransition(e) {

}

// Add event listeners
drumKeys.forEach(key => key.addEventListener('click', playSound));
