// Authored demo content. Replace this object with your own reviewed lesson data.
window.unfoldSampleLesson = {
  id:'cellular-respiration-guided', version:'1', title:'Cellular respiration', topic:'Biology',
  sections:[
    {id:'glycolysis',title:'Start by splitting glucose',
      source:'Glycolysis occurs in the cytoplasm. One glucose molecule is split into two pyruvate molecules, with a net gain of two ATP and two NADH.',
      quote:'Glycolysis occurs in the cytoplasm.',
      summary:'Cellular respiration starts with glycolysis in the cytoplasm. One glucose molecule splits into two pyruvate molecules. This step gives the cell a net gain of two ATP and two NADH.',
      steps:['Where: the cytoplasm.','What happens: one glucose becomes two pyruvate.','What the cell gains: net two ATP and two NADH.'],
      change:'Separated location, action and products into three steps. Kept the molecule counts and “net” gain.',
      recap:'In the cytoplasm, glycolysis splits glucose into two pyruvate, yielding net two ATP and two NADH.',
      question:{prompt:'Where does glycolysis happen?',options:['In the mitochondrial matrix','In the cytoplasm','On the inner mitochondrial membrane'],correct:1,explanation:'Glycolysis happens in the cytoplasm. Later stages take place in the mitochondria in eukaryotic cells.'}},
    {id:'carriers',title:'Collect the electron carriers',
      source:'In eukaryotic cells, pyruvate oxidation and the citric acid cycle take place in the mitochondrial matrix. Carbon dioxide is released, and the electron carriers NADH and FADH2 are produced.',
      quote:'the electron carriers NADH and FADH2 are produced.',
      summary:'Next, in eukaryotic cells, pyruvate oxidation and the citric acid cycle happen in the mitochondrial matrix. Carbon dioxide is released. These stages produce electron carriers, NADH and FADH2, for the next part of the process.',
      steps:['Where: the mitochondrial matrix in eukaryotic cells.','Stages: pyruvate oxidation, then the citric acid cycle.','Outputs include carbon dioxide and the electron carriers NADH and FADH2.'],
      change:'Separated the place, stages and outputs. Kept the eukaryotic-cell qualification.',
      recap:'In the mitochondrial matrix, the next stages release carbon dioxide and produce electron carriers.',
      question:{prompt:'What carries electrons to the next stage?',options:['Carbon dioxide','NADH and FADH2','Glucose alone'],correct:1,explanation:'NADH and FADH2 are electron carriers. Carbon dioxide is released during these stages.'}},
    {id:'atp',title:'Use the gradient to make ATP',
      source:'The electron transport chain is located in the inner mitochondrial membrane. Electrons from NADH and FADH2 help establish a proton gradient. This gradient drives ATP synthase to produce ATP. Oxygen is the final electron acceptor, and water is formed.',
      quote:'This gradient drives ATP synthase to produce ATP.',
      summary:'At the inner mitochondrial membrane, electrons from NADH and FADH2 help build a proton gradient. That gradient drives ATP synthase to make ATP. Oxygen accepts the electrons at the end, and water forms.',
      steps:['Electron carriers supply electrons at the inner mitochondrial membrane.','Electron transport helps establish a proton gradient.','The gradient drives ATP synthase, producing ATP. Oxygen is the final electron acceptor; water forms.'],
      change:'Made the cause-and-effect sequence explicit. Kept the proton gradient and oxygen’s role.',
      recap:'Electron transport creates a proton gradient that drives ATP production; oxygen is the final electron acceptor.',
      question:{prompt:'What directly drives ATP synthase here?',options:['The proton gradient','Carbon dioxide leaving the cell','Glucose splitting in the cytoplasm'],correct:0,explanation:'The proton gradient drives ATP synthase. Electron transport helps create that gradient.'}}
  ]
};
