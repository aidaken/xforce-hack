// Seed readings. The two Biology 101 entries are lifted verbatim from the Addy
// design project so the demo matches the approved copy. The class folders after
// them are remade from real course sources (URL on each entry's `source`), hand
// written in the same schema the design set: `sents` stays faithful to the
// source, `steps` is the remake, and `flags` names whatever the remake dropped
// or compressed. Anything a user ingests at runtime is appended to this list in
// state, not written back here.
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


    // Source: OpenStax Calculus Volume 1 § 3.6 The Chain Rule
    // https://openstax.org/books/calculus-volume-1/pages/3-6-the-chain-rule
    {id:'calc1',folder:'Calculus I',title:'The chain rule',mins:6,status:'In progress',rec:'flowchart',
     source:{id:'calc1',conceptType:'process',url:'https://openstax.org/books/calculus-volume-1/pages/3-6-the-chain-rule'},
     rationale:'The source gives a four-step procedure you run in order, so I made it a flowchart.',
     why:"The section is built around a problem-solving strategy where each step feeds the next: you cannot evaluate f' at g(x) before you have named g. A flowchart holds that order so you are not tracking which layer you are on while you differentiate.",
     flags:["The source's worked examples were left out; only the rule and its steps are shown.",
            "The source's warning not to evaluate a derivative at another derivative is folded into the third box."],
     sents:[
      {id:'c1',t:'The chain rule tells you how to differentiate a composite function, one function wrapped inside another.'},
      {id:'c2',t:"The derivative of h(x) = f(g(x)) is h'(x) = f'(g(x)) · g'(x)."},
      {id:'c3',t:'In Leibniz notation, if y is a function of u and u is a function of x, then dy/dx = dy/du · du/dx.'},
      {id:'c4',t:'The first step is to identify the outer function f and the inner function g.'},
      {id:'c5',t:"Next, find f'(x) and evaluate it at g(x) to obtain f'(g(x)), leaving the inside untouched."},
      {id:'c6',t:"Then find g'(x), the derivative of the inner function on its own."},
      {id:'c7',t:"Finally, write h'(x) = f'(g(x)) · g'(x)."},
      {id:'c8',t:"When the outer function is a power, the rule shortens to h'(x) = n(g(x))^(n-1) · g'(x)."},
      {id:'c9',t:"For three layers, k(x) = h(f(g(x))), the derivative is k'(x) = h'(f(g(x))) · f'(g(x)) · g'(x)."}],
     steps:[
      {t:'What the rule is for',b:'A composite function is one function inside another. The chain rule differentiates it.',s:['c1','c2','c3'],q:'The chain rule applies when...',o:['Two functions are added','One function is inside another','A function is squared'],a:1},
      {t:'Name the outer and the inner',b:'Decide which function is f (the outer) and which is g (the inner). Work from the outside in.',s:['c4'],q:'Which function do you name first?',o:['The outer one','The inner one','Either, it does not matter'],a:0},
      {t:"Differentiate the outer, keep the inside",b:"Find f'(x), then plug g(x) into it. The inside stays exactly as it was.",s:['c5'],q:"Where do you evaluate f'?",o:["At x","At g(x)","At g'(x)"],a:1},
      {t:'Differentiate the inner',b:"Find g'(x) by itself.",s:['c6'],q:"What is g'(x)?",o:['The derivative of the inner function','The derivative of the whole thing','The inner function again'],a:0},
      {t:'Multiply the layers',b:"h'(x) = f'(g(x)) · g'(x). Forgetting this multiplication is the most common mistake.",s:['c7'],q:'What joins the two derivatives?',o:['Addition','Multiplication','Division'],a:1},
      {t:'Shortcut: a power on the outside',b:"If the outer function is a power, h'(x) = n(g(x))^(n-1) · g'(x).",s:['c8'],q:'What still has to be multiplied on at the end?',o:["g'(x)","n","g(x)"],a:0},
      {t:'Three layers instead of two',b:"Apply the rule twice: k'(x) = h'(f(g(x))) · f'(g(x)) · g'(x). One derivative per layer.",s:['c9'],q:'How many factors does a three-function composition give?',o:['Two','Three','Four'],a:1}]},

    // Source: OpenStax University Physics Volume 2 § 6.3 Applying Gauss's Law
    // https://openstax.org/books/university-physics-volume-2/pages/6-3-applying-gausss-law
    {id:'phys1',folder:'Physics II',title:"Applying Gauss's law",mins:7,status:'Not started',rec:'flowchart',
     source:{id:'phys1',conceptType:'process',url:'https://openstax.org/books/university-physics-volume-2/pages/6-3-applying-gausss-law'},
     rationale:'The source lays out a five-step strategy you run in order, so I made it a flowchart.',
     why:'Every step depends on the one before it: the symmetry decides the surface, the surface decides how the flux integral collapses, and only then can you solve for the field. Keeping the order visible stops you from picking a surface before you have looked at the symmetry.',
     flags:["The source writes the flux as the integral of E · n dA. The boxes say \"field magnitude times area\", which is only true once step 2 has chosen a surface where the magnitude is constant."],
     sents:[
      {id:'g1',t:"Gauss's law relates the electric flux through a closed surface to the charge enclosed by that surface."},
      {id:'g2',t:'It is a shortcut only when the charge distribution is symmetric enough that you can find a surface where the field has constant magnitude.'},
      {id:'g3',t:'The first step is to identify the spatial symmetry of the charge distribution.'},
      {id:'g4',t:'The symmetry tells you which Gaussian surface to choose, so that the direction of the field relative to the surface is determinate at every point.'},
      {id:'g5',t:'On such a surface the flux integral collapses to the field magnitude times the area, with constants pulled outside.'},
      {id:'g6',t:'Next, work out the enclosed charge, which sometimes takes an integral of its own.'},
      {id:'g7',t:"Finally, solve Gauss's law for the field magnitude."}],
     steps:[
      {t:'Identify the symmetry',b:'Look at the charge distribution first. Spherical, cylindrical, or planar. This choice drives everything after it.',s:['g1','g2','g3'],q:'What is the first step?',o:['Pick a surface','Identify the symmetry','Find the enclosed charge'],a:1},
      {t:'Choose the Gaussian surface',b:'Pick a closed surface that matches the symmetry, so the field is the same size everywhere on it.',s:['g4'],q:'What makes a Gaussian surface a good one?',o:['It is the smallest possible','The field has constant magnitude on it','It touches the charge'],a:1},
      {t:'Evaluate the flux',b:'With the right surface the integral becomes field magnitude times area. Constants come outside.',s:['g5'],q:'Why does the integral simplify?',o:['The charge is zero','The field magnitude is constant on the surface','Area is always one'],a:1},
      {t:'Find the enclosed charge',b:'Add up only the charge inside the surface. A spread-out distribution may need its own integral.',s:['g6'],q:'Which charge counts?',o:['All the charge in the problem','Only the charge inside the surface','Only the charge on the surface'],a:1},
      {t:'Solve for the field',b:"Put the flux and the enclosed charge into Gauss's law and read off the field magnitude.",s:['g7'],q:'What do you get out at the end?',o:['The field magnitude','The total charge','The surface area'],a:0}]},

    {id:'phys2',folder:'Physics II',title:'Choosing a Gaussian surface',mins:5,status:'Not started',rec:'checklist',
     source:{id:'phys2',conceptType:'rule_system',url:'https://openstax.org/books/university-physics-volume-2/pages/6-3-applying-gausss-law'},
     rationale:'These are three separate cases you match against, not a sequence, so I made it a checklist.',
     why:'Nothing here happens in an order. You look at your charge distribution, find the case it fits, and take the surface that goes with it. Numbering them as a flow would suggest a sequence the source never claims.',
     flags:[],
     sents:[
      {id:'p1',t:"Three kinds of symmetry make Gauss's law easy, and each one has its own Gaussian surface."},
      {id:'p2',t:'A distribution has spherical symmetry when the charge density depends only on distance from a center point.'},
      {id:'p3',t:'The field is then directed radially, and a concentric sphere gives a flux of E times 4(pi)r^2.'},
      {id:'p4',t:'A distribution has cylindrical symmetry when the density varies only with perpendicular distance from an axis.'},
      {id:'p5',t:'The field points radially away from the axis, and a coaxial cylinder of length L gives a flux of E times 2(pi)rL.'},
      {id:'p6',t:'A distribution has planar symmetry when the charge is spread uniformly across a flat sheet.'},
      {id:'p7',t:'The field is perpendicular to the sheet, and a box straddling the plane gives a flux of E times 2A through the two parallel faces.'}],
     steps:[
      {t:'Check the symmetry first',b:'Which of the three cases does your charge distribution fit? Everything else follows from that.',s:['p1'],q:'How many symmetry cases does the section give?',o:['Two','Three','Five'],a:1},
      {t:'Spherical · use a concentric sphere',b:'Density depends only on distance from a point. Field is radial. Flux = E · 4(pi)r^2.',s:['p2','p3'],q:'Spherical symmetry pairs with which surface?',o:['A concentric sphere','A coaxial cylinder','A box'],a:0},
      {t:'Cylindrical · use a coaxial cylinder',b:'Density depends only on distance from an axis. Field points away from the axis. Flux = E · 2(pi)rL.',s:['p4','p5'],q:'What does L stand for in the cylindrical flux?',o:['The radius','The length of the cylinder','The charge'],a:1},
      {t:'Planar · use a box through the sheet',b:'Charge spread evenly on a flat sheet. Field is perpendicular to it. Only the two parallel faces carry flux: E · 2A.',s:['p6','p7'],q:'How many faces of the box carry flux?',o:['All six','Two','One'],a:1}]},

    // Source: React docs - useEffect reference
    // https://react.dev/reference/react/useEffect
    {id:'react1',folder:'Web Development',title:'useEffect',mins:6,status:'In progress',rec:'checklist',
     source:{id:'react1',conceptType:'rule_system',url:'https://react.dev/reference/react/useEffect'},
     rationale:'This is a set of rules you check one at a time rather than a process, so I made it a checklist.',
     why:'The reference page is a list of independent rules: where you may call the Hook, when setup and cleanup run, what the dependency array does. None of them has to happen before another, so a checklist fits and a flowchart would invent an order.',
     flags:["The caveats about object and function dependencies, and about switching to useLayoutEffect, were left out."],
     sents:[
      {id:'u1',t:'useEffect lets a component synchronize with an external system.'},
      {id:'u2',t:'If you are not synchronizing with an external system, you probably do not need an effect.'},
      {id:'u3',t:'It is a Hook, so you can only call it at the top level of a component or of your own Hook, never inside a loop or a condition.'},
      {id:'u4',t:'You call it with a setup function and an optional list of dependencies.'},
      {id:'u5',t:'React runs the setup function after the component commits.'},
      {id:'u6',t:'The setup function may return a cleanup function, which React runs with the old values before the next setup and once more after the component is removed from the DOM.'},
      {id:'u7',t:'The dependency list must name every reactive value the setup code reads: props, state, and anything declared in the component body.'},
      {id:'u8',t:'React compares each dependency with its previous value using Object.is.'},
      {id:'u9',t:'If you omit the dependency argument, the effect re-runs after every commit.'},
      {id:'u10',t:'If you pass an empty array, the effect runs only after the initial commit.'},
      {id:'u11',t:'In Strict Mode, React runs one extra development-only setup and cleanup cycle before the first real setup, to check that cleanup mirrors setup.'},
      {id:'u12',t:'Effects only run on the client; they do not run during server rendering.'}],
     steps:[
      {t:'Use it to sync with something outside React',b:'That is what it is for. If you are only transforming data for rendering, you do not need it.',s:['u1','u2'],q:'What is useEffect for?',o:['Transforming data for render','Synchronizing with an external system','Storing state'],a:1},
      {t:'Call it at the top level',b:'Never inside a loop, a condition, or a nested function. Component body or your own Hook only.',s:['u3'],q:'Can you call useEffect inside an if statement?',o:['Yes','No','Only in development'],a:1},
      {t:'Setup runs after commit; cleanup mirrors it',b:'React runs setup after the commit. If setup returns a cleanup, React runs it with the old values before the next setup, and again on unmount.',s:['u4','u5','u6'],q:'When does cleanup run with the old values?',o:['Before the next setup','After the next setup','Never'],a:0},
      {t:'List every reactive value you read',b:'Props, state, and anything declared in the component body. React compares them with Object.is.',s:['u7','u8'],q:'What does React use to compare dependencies?',o:['Object.is','JSON.stringify','Strict equality on the array'],a:0},
      {t:'Omitted vs [] vs a list',b:'No array: re-runs after every commit. Empty array: runs once after the initial commit. A list: re-runs when one of those values changes.',s:['u9','u10'],q:'What does an empty dependency array mean?',o:['Runs after every commit','Runs only after the initial commit','Never runs'],a:1},
      {t:'Strict Mode double-runs, and the client only',b:'In development, Strict Mode adds one extra setup and cleanup cycle to test your cleanup. Effects never run during server rendering.',s:['u11','u12'],q:'Why does Strict Mode run the effect twice in development?',o:['To make it faster','To stress-test your cleanup','It is a bug'],a:1}]},

    // Source: OpenStax U.S. History § 1.1 The Americas
    // https://openstax.org/books/us-history/pages/1-1-the-americas
    {id:'ushist1',folder:'US History',title:'The Americas before 1492',mins:9,status:'Not started',rec:'quest',
     source:{id:'ushist1',conceptType:'definition_cluster',url:'https://openstax.org/books/us-history/pages/1-1-the-americas'},
     rationale:'This is a run of names, places, and dates that blur together, so I turned it into a quest you move through one civilization at a time.',
     why:'Five peoples across four thousand years is a lot to hold at once. Revealing one at a time, with a question after each, keeps the Olmec from sliding into the Maya before you have finished reading about them.',
     flags:["The section on Eastern Woodland clans and their matriarchal councils is not in this remake.",
            "Dates are kept as the source gives them, including the wide 9,000 to 15,000 year range for the crossing."],
     sents:[
      {id:'a1',t:'Between 9,000 and 15,000 years ago, people crossed a land bridge called Beringia from Asia into the Americas in search of food.'},
      {id:'a2',t:'When the glaciers melted, water engulfed Beringia and the Bering Strait was formed.'},
      {id:'a3',t:"From about 1200 to 400 BCE the Olmec lived on Mexico's Gulf Coast, and later peoples borrowed so much from them that they are called the mother of Mesoamerican cultures."},
      {id:'a4',t:'The Olmec built the pyramid at La Venta, carved giant stone heads, and left the only known written language in the Western Hemisphere.'},
      {id:'a5',t:'The Maya perfected the calendar and written language the Olmec had begun, and built city-states such as Copan, Tikal, and Chichen Itza.'},
      {id:'a6',t:'Poor soil and a drought that lasted nearly two centuries pushed the Maya into decline by 900 CE.'},
      {id:'a7',t:'The Aztec founded Tenochtitlan in 1325 on an island in Lake Texcoco, and by 1519 it held upwards of 200,000 people, the largest city in the Western Hemisphere.'},
      {id:'a8',t:'Tenochtitlan was fed by chinampas, floating gardens built out into the lake, and served by aqueducts and markets.'},
      {id:'a9',t:'The Inca empire extended some twenty-five hundred miles down the Andes, tied together by a road system that rivaled that of the Romans.'},
      {id:'a10',t:'Having no written language, the Inca kept records on the quipu, a system of colored strings and knots.'},
      {id:'a11',t:'In the Southwest the Ancestral Puebloans carved homes from steep cliffs reached by ladders or ropes, and linked their centers with roads running some 180 miles.'},
      {id:'a12',t:'Near present-day St. Louis, Cahokia peaked around 1100 CE with more than 10,000 residents and 120 earthen mounds.'}],
     steps:[
      {t:'Arrival · Beringia',b:'People crossed a land bridge from Asia between 9,000 and 15,000 years ago. The melting glaciers drowned it and left the Bering Strait.',s:['a1','a2'],q:'What was Beringia?',o:['A land bridge from Asia','An early Maya city','A trade route by sea'],a:0},
      {t:'The Olmec · 1200 to 400 BCE',b:"On Mexico's Gulf Coast. Giant stone heads, the pyramid at La Venta, and the only known written language in the Western Hemisphere. Later cultures borrowed so much that the Olmec are called the mother culture.",s:['a3','a4'],q:'Why are the Olmec called the mother of Mesoamerican cultures?',o:['They were the largest','Later peoples borrowed heavily from them','They lasted the longest'],a:1},
      {t:'The Maya',b:'They perfected the Olmec calendar and writing and built city-states like Copan, Tikal, and Chichen Itza. Poor soil and a two-century drought brought decline by 900 CE.',s:['a5','a6'],q:'What pushed the Maya into decline?',o:['Invasion','Poor soil and a long drought','A flood'],a:1},
      {t:'The Aztec · Tenochtitlan',b:'Founded 1325 on an island in Lake Texcoco. By 1519 it held upwards of 200,000 people, fed by chinampas, the floating gardens, and served by aqueducts and markets.',s:['a7','a8'],q:'When was Tenochtitlan founded?',o:['1325','1519','900'],a:0},
      {t:'The Inca · the Andes',b:'An empire some twenty-five hundred miles long, held together by roads that rivaled the Romans. With no writing, records were kept on the quipu, colored strings and knots.',s:['a9','a10'],q:'What was a quipu?',o:['A road','A record kept in colored strings and knots','A temple'],a:1},
      {t:'North of Mexico',b:'The Ancestral Puebloans carved cliff homes reached by ladders and linked their centers with 180 miles of roads. Cahokia, near present-day St. Louis, peaked around 1100 CE with 10,000 residents and 120 mounds.',s:['a11','a12'],q:'What was Cahokia?',o:['A cliff dwelling in the Southwest','A large mound-building center near present-day St. Louis','An Inca road'],a:1}]}
  ];

export const FOLDER_NAMES = ['Biology 101', 'Calculus I', 'Physics II', 'Web Development', 'US History'];

export const FOLDER_TINTS = {
  'Biology 101': 'var(--sage)',
  'Calculus I': 'var(--clay)',
  'Physics II': 'var(--warn)',
  'Web Development': 'var(--ok)',
  'US History': 'var(--ochre)',
};

export const FORMAT_NAMES = { guided: 'Guided', flowchart: 'Flowchart', checklist: 'Checklist', quest: 'Quest' };
export const FORMAT_ICONS = { guided: '◇', flowchart: '⌗', checklist: '✓', quest: '★' };
