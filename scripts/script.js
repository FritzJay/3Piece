const drums = document.getElementById('drums');
const guitar = document.getElementById('guitar');
const bass = document.getElementById('bass');

const drumKeys = drums.querySelectorAll('button');
drumKeys.forEach(key => key.addEventListener('click', playSound));

function playSound(e) {
  console.log('playSound');
}

function removeTransition(e) {

}
