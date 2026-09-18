customElements.whenDefined('reading-coach').then(() => {
  const coach = document.querySelector('reading-coach');
  coach.lesson = window.unfoldSampleLesson;
  const showReward = () => { document.querySelector('#reward').hidden = false; };
  coach.addEventListener('reading-completed', showReward);
  if (coach.state.stage === 'done') showReward();
});
