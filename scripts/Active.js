/* eslint semi: [0, "never"] */
/* eslint-env browser */

function removeActive(element, keys, saveButton, saveText, savedData) {
  //Check if object passed in is an instrument
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
    // Remove active on basic element
    element.classList.remove('active');
    // Remove event listener to prevent event from being fired multiple times
    element.removeEventListener('transitionend', removeActive);
  }
}

function addActive(element, keys, saveButton, saveText, savedData) {
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
  } else {
    // start button transition via css
    element.classList.add('active');
    // listen for button css transition end
    element.addEventListener('transitionend', removeActive(button));
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
    removeActiveInstrument(instrument, otherKeys, otherSaveButton, otherSaveText, otherSavedData);
  });
}
