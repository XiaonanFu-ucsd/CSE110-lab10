// speechSynth.js

const synth = window.speechSynthesis;
let voices;

window.addEventListener('DOMContentLoaded', init);

function init() {
  setTimeout(() => populateVoices(), 50);
  bindListeners();
  featureFlag();
}

let isVoicesReady = false;

function populateVoices() {
  const voiceSelect = document.querySelector('#voice-select');
  voices = synth.getVoices();
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.innerHTML = `${voice.name} (${voice.lang})`;
    option.setAttribute('value', `${voice.name} (${voice.lang})`);
    option.setAttribute('data-index', voiceSelect.children.length - 1)
    voiceSelect.appendChild(option);
  });
    isVoicesReady = true;
}

function reduceVoices() {
    const voiceSelect = document.querySelector('#voice-select');
    let index = 0;
    while (index < voiceSelect.children.length) {
        if (!voiceSelect.children[index].textContent.includes('(en-US')) {
            voiceSelect.removeChild(voiceSelect.children[index]);
            index--;
        }
        index++;
    }
}

function featureFlag() {
    const clientSideID = '647c4327830765131d495237';
    const flagKey = 'reduce-voices';
    const context = {
      kind: 'user',
      key: Math.random().toString(36).substring(7),
    };

    const ldclient = LDClient.initialize(clientSideID, context);

    async function render() {
        console.log('render');
        const flagValue = ldclient.variation(flagKey, true);
        console.log(flagValue);
        if (flagValue) {
            while (!isVoicesReady) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            reduceVoices();
        }
    }

    ldclient.on('initialized', () => {
        console.log('SDK successfully initialized!');
    });
    ldclient.on('failed', () => {
        console.log('SDK failed to initialize');
    });
    ldclient.on('ready', render);
    ldclient.on('change', render);
    ldclient.close();
}

function bindListeners() {
  const talkBtn = document.querySelector('#explore > button');
  const textarea = document.querySelector('#explore > textarea');

  talkBtn.addEventListener('click', () => {
    let textToSpeak = textarea.value;
    let utterThis = new SpeechSynthesisUtterance(textToSpeak);
    utterThis.voice = voices[getOptionIndex()];
    synth.speak(utterThis);
    openMouth();
  })
}

function getOptionIndex() {
  const voiceSelect = document.querySelector('#voice-select');
  const option = voiceSelect.options[voiceSelect.selectedIndex];
  return option.getAttribute('data-index');
}

function openMouth() {
  let face = document.querySelector('#explore > img');
  face.setAttribute('src', 'assets/images/smiling-open.png');
  setTimeout(() => {
    if (synth.speaking) {
      openMouth();
    } else {
      face.setAttribute('src', 'assets/images/smiling.png');
    }
  }, 100);
}
