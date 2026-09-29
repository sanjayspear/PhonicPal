/* First-visit welcome tour. The full guide remains available from the Help screen. */
const tour = $('#welcomeTour');
const tourTitle = $('#tourTitle');
const tourText = $('#tourText');
const tourProgress = $('#tourProgress');
const tourNext = $('#nextTour');
const tourSteps = [
    { title: 'Welcome to PhonicsPal!', text: 'PhonicsPal helps children practice English sounds, reading, and new words. You can use it with a parent, teacher, or on your own.' },
    { title: '1. Choose something to learn', text: 'Open Phonics to practice sounds, paste a passage in Read With Me, or choose a PDF, TXT, or EPUB in My Books.' },
    { title: '2. Choose where reading begins', text: 'In Read With Me, click in your text and place the cursor at the point where you want to start.' },
    { title: '3. Read from the cursor', text: 'Choose Read From Here. PhonicsPal starts at your cursor and continues through the rest of your text.' },
    { title: '4. Pause or continue', text: 'Pause holds your place. Resume continues from there. Stop ends the reading session and resets it.' },
    { title: '5. Pick a voice', text: 'Choose Browser voice to start right away. Natural Voices are listed in the voice menu at the top and download only when you choose Download & Activate Voice.' },
    { title: '6. Get help any time', text: 'Choose ? Help in the top navigation to see the full button guide, voice help, and troubleshooting. You can restart this tour there too.' }
];
let tourStep = 0;
let returnFocus = null;

function renderTourStep() {
    const step = tourSteps[tourStep];
    tourTitle.textContent = step.title;
    tourText.textContent = step.text;
    tourProgress.textContent = 'Step ' + (tourStep + 1) + ' of ' + tourSteps.length;
    tourNext.textContent = tourStep === tourSteps.length - 1 ? 'Finish' : 'Continue';
}

function openWelcomeTour() {
    if (tour.open) return;
    returnFocus = document.activeElement;
    tourStep = 0;
    renderTourStep();
    tour.showModal();
    tourNext.focus();
}

function closeWelcomeTour() {
    if (tour.open) tour.close();
    LS.set('pp_intro_seen', true);
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
}

tourNext.onclick = () => {
    if (tourStep < tourSteps.length - 1) {
        tourStep++;
        renderTourStep();
    } else closeWelcomeTour();
};
$('#skipTour').onclick = closeWelcomeTour;
$('#restartTour').onclick = openWelcomeTour;
tour.addEventListener('cancel', event => {
    event.preventDefault();
    closeWelcomeTour();
});

if (!LS.get('pp_intro_seen', false)) setTimeout(openWelcomeTour, 350);
