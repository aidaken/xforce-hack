// Seed readings, lifted verbatim from the Addy design project so the demo
// content matches the approved copy. Anything a user ingests at runtime is
// appended to this list in state, not written back here.
export const SEED_READINGS = [
    {id:'bio1',folder:'Biology 101',title:'Cellular respiration',mins:6,status:'In progress',rec:'flowchart',
     rationale:'This passage describes a step-by-step process, so I made it a flowchart.',
     why:'The source moves through three named stages in a fixed order, and each stage hands something to the next one. A flowchart holds that order for you, so you do not have to keep it in your head while you read.',
     flags:['The sentence about a net gain of two ATP was folded into the glycolysis box rather than given a box of its own.'],
     sents:[
      {id:'s1',t:'Cellular respiration is the process cells use to turn glucose into usable energy.'},
      {id:'s2',t:'It happens in three main stages.'},
      {id:'s3',t:'The first stage, glycolysis, takes place in the cytoplasm and splits one glucose molecule into two molecules of pyruvate.'},
      {id:'s4',t:'This stage produces a small net gain of two ATP.'},
      {id:'s5',t:'In the second stage the pyruvate moves into the mitochondrion and enters the Krebs cycle.'},
      {id:'s6',t:'The Krebs cycle releases carbon dioxide and loads electron carriers called NADH and FADH2.'},
      {id:'s7',t:'In the third stage those carriers drop their electrons into the electron transport chain on the inner mitochondrial membrane.'},
      {id:'s8',t:'Oxygen accepts the electrons at the end of the chain, and the energy released pumps protons that drive ATP synthase.'},
      {id:'s9',t:'Altogether, one glucose molecule yields about 30 to 32 ATP.'}],
     steps:[
      {t:'Glucose arrives',b:'A cell takes in glucose and starts breaking it down for energy.',s:['s1','s2'],q:'How many main stages does respiration have?',o:['Two','Three','Five'],a:1},
      {t:'Glycolysis · in the cytoplasm',b:'One glucose splits into two pyruvate. Net gain so far: 2 ATP.',s:['s3','s4'],q:'Where does glycolysis happen?',o:['The cytoplasm','The nucleus','The inner membrane'],a:0},
      {t:'Krebs cycle · in the mitochondrion',b:'Pyruvate enters the cycle. Carbon dioxide leaves; NADH and FADH2 get loaded up.',s:['s5','s6'],q:'What does the Krebs cycle load up?',o:['Oxygen','Electron carriers','Glucose'],a:1},
      {t:'Electron transport chain',b:'The carriers drop electrons along the inner membrane. The energy released pumps protons that drive ATP synthase.',s:['s7','s8'],q:'What accepts the electrons at the end of the chain?',o:['Carbon dioxide','Water','Oxygen'],a:2},
      {t:'The payoff',b:'About 30 to 32 ATP from a single glucose molecule.',s:['s9'],q:'Roughly how much ATP comes from one glucose?',o:['2','12','30 to 32'],a:2}]},

    {id:'bio2',folder:'Biology 101',title:'Moving things across the cell membrane',mins:4,status:'Not started',rec:'checklist',
     rationale:'These are four separate rules rather than one process, so I made it a checklist.',
     why:'Nothing in the passage has to happen in order. It is a set of cases you check one at a time, which is what a checklist is for.',
     flags:[],
     sents:[
      {id:'m1',t:'The cell membrane controls what enters and leaves the cell.'},
      {id:'m2',t:'Small molecules such as oxygen slip through on their own, moving from high concentration to low concentration, which is called passive diffusion.'},
      {id:'m3',t:'Water crosses through special channels called aquaporins, a process known as osmosis.'},
      {id:'m4',t:'Larger molecules such as glucose need a transport protein to carry them across, and when no energy is spent this is facilitated diffusion.'},
      {id:'m5',t:'When the cell moves something against its concentration gradient it has to spend ATP, and that is active transport.'}],
     steps:[
      {t:'Passive diffusion',b:'Small molecules cross on their own, high concentration to low. No energy needed.',s:['m1','m2'],q:'Which way do molecules move in passive diffusion?',o:['High to low concentration','Low to high concentration','Either way'],a:0},
      {t:'Osmosis',b:'Water crosses through channels called aquaporins.',s:['m3'],q:'What are aquaporins for?',o:['Glucose','Water','Oxygen'],a:1},
      {t:'Facilitated diffusion',b:'Bigger molecules like glucose ride a transport protein, still without spending energy.',s:['m4'],q:'Does facilitated diffusion cost the cell energy?',o:['Yes, always','No','Only at night'],a:1},
      {t:'Active transport',b:'Going against the gradient costs ATP.',s:['m5'],q:'What does the cell spend on active transport?',o:['ATP','Water','Carbon dioxide'],a:0}]},

    {id:'econ1',folder:'Intro to Economics',title:'Supply and demand',mins:5,status:'In progress',rec:'checklist',
     rationale:'This passage lays out rules you check one at a time, so I made it a checklist.',
     why:'Each sentence states a rule that stands on its own. Numbering them as a flow would suggest an order the source never claims.',
     flags:['"A change in income, tastes, or the price of a related good" is compressed to "income, tastes, or related prices" in the last item.'],
     sents:[
      {id:'e1',t:'A market price settles where the plans of buyers and sellers agree.'},
      {id:'e2',t:'The demand curve slopes downward: as price falls, buyers want more.'},
      {id:'e3',t:'The supply curve slopes upward: as price rises, sellers offer more.'},
      {id:'e4',t:'Equilibrium is the price at which quantity demanded equals quantity supplied.'},
      {id:'e5',t:'If the price sits above equilibrium a surplus builds up and sellers cut prices.'},
      {id:'e6',t:'If the price sits below equilibrium a shortage appears and buyers bid the price up.'},
      {id:'e7',t:'A change in income, tastes, or the price of a related good shifts the whole demand curve rather than moving along it.'}],
     steps:[
      {t:'Demand slopes down',b:'Lower price, buyers want more.',s:['e2'],q:'When price falls, quantity demanded...',o:['Rises','Falls','Stays put'],a:0},
      {t:'Supply slopes up',b:'Higher price, sellers offer more.',s:['e3'],q:'What makes sellers offer more?',o:['A higher price','A lower price','Nothing'],a:0},
      {t:'Equilibrium',b:'The price where the two quantities match, and where the market settles.',s:['e1','e4'],q:'At equilibrium, quantity demanded is...',o:['Above supply','Equal to supply','Below supply'],a:1},
      {t:'Surplus and shortage',b:'Price above equilibrium leaves a surplus; price below leaves a shortage.',s:['e5','e6'],q:'A price below equilibrium causes a...',o:['Surplus','Shortage','Tax'],a:1},
      {t:'Shifts vs movements',b:'Income, tastes, or related prices move the whole curve. Price alone just moves you along it.',s:['e7'],q:'What shifts the whole demand curve?',o:['A change in price','A change in income','Nothing'],a:1}]},

    {id:'econ2',folder:'Intro to Economics',title:'Elasticity',mins:4,status:'Not started',rec:'quest',
     rationale:'This one is short and easy to mix up, so I turned it into a quest with quick checks.',
     why:'Elastic and inelastic get confused constantly. Answering after each step is a cheap way to catch that early.',
     flags:[],
     sents:[
      {id:'x1',t:'Elasticity measures how much quantity responds to a change in price.'},
      {id:'x2',t:'Demand is elastic when a small price rise causes a large drop in quantity, which is common for goods with close substitutes.'},
      {id:'x3',t:'Demand is inelastic when quantity barely moves, as with insulin or petrol in the short run.'},
      {id:'x4',t:'Total revenue rises with a price cut when demand is elastic and falls when demand is inelastic.'}],
     steps:[
      {t:'What elasticity measures',b:'How strongly quantity reacts when price changes.',s:['x1'],q:'Elasticity compares quantity to...',o:['Price','Income','Time'],a:0},
      {t:'Elastic vs inelastic',b:'Elastic: quantity swings a lot, usually where substitutes exist. Inelastic: quantity barely moves, like insulin.',s:['x2','x3'],q:'Insulin demand is...',o:['Elastic','Inelastic','Neither'],a:1},
      {t:'Why it matters',b:'Cutting price raises revenue when demand is elastic, and lowers it when demand is inelastic.',s:['x4'],q:'A price cut on an elastic good does what to revenue?',o:['Raises it','Lowers it','No effect'],a:0}]},

    {id:'hist1',folder:'History Essay',title:'The Marshall Plan',mins:8,status:'Not started',rec:'quest',
     rationale:'This reads as a story with a clear order of events, so I turned it into a quest you move through one step at a time.',
     why:'Dates and names pile up quickly here. Revealing one beat at a time, with a question after each, keeps the sequence from blurring together.',
     flags:['The figure "about thirteen billion dollars" is kept verbatim; no adjusted-for-inflation number was added.'],
     sents:[
      {id:'h1',t:'By 1947 much of Western Europe was still in ruins, with factories idle and food rationed.'},
      {id:'h2',t:'American officials worried that hunger and unemployment would push voters toward communist parties.'},
      {id:'h3',t:'In June 1947 Secretary of State George Marshall proposed that the United States fund a recovery plan the Europeans would design themselves.'},
      {id:'h4',t:'Sixteen countries met in Paris and drew up a joint request for aid.'},
      {id:'h5',t:'Congress approved the European Recovery Program in April 1948, and about thirteen billion dollars flowed to Europe over four years.'},
      {id:'h6',t:'The Soviet Union rejected the plan and pressed its neighbours to do the same, deepening the divide across the continent.'}],
     steps:[
      {t:'The problem, 1947',b:'Europe was still wrecked, and Washington feared hunger would turn voters toward communist parties.',s:['h1','h2'],q:'What worried American officials most?',o:['A new war','Communist parties gaining votes','Falling exports'],a:1},
      {t:"Marshall's proposal",b:'June 1947: the United States would pay for recovery, but Europeans would write the plan.',s:['h3'],q:'Who was to design the plan?',o:['The Europeans','The US Army','The United Nations'],a:0},
      {t:'Europe responds',b:'Sixteen countries met in Paris. Congress approved the programme in April 1948 and about thirteen billion dollars followed over four years.',s:['h4','h5'],q:'How many countries met in Paris?',o:['Six','Sixteen','Sixty'],a:1},
      {t:'The split',b:'The Soviet Union refused and pushed its neighbours to refuse too, widening the divide.',s:['h6'],q:'What was the effect of the Soviet refusal?',o:['A wider divide in Europe','More aid for Moscow','The plan was cancelled'],a:0}]}
  ];

export const FOLDER_NAMES = ['Biology 101', 'Intro to Economics', 'History Essay'];

export const FOLDER_TINTS = {
  'Biology 101': 'var(--sage)',
  'Intro to Economics': 'var(--clay)',
  'History Essay': 'var(--warn)',
};

export const FORMAT_NAMES = { guided: 'Guided', flowchart: 'Flowchart', checklist: 'Checklist', quest: 'Quest' };
export const FORMAT_ICONS = { guided: '◇', flowchart: '⌗', checklist: '✓', quest: '★' };
