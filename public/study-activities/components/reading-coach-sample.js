// Original teaching text. Definition reference: MIT OCW, Algebra II, Lecture 1.
window.unfoldSampleLesson = {
 id:'representation-theory-guided', version:'1', title:'Representation theory', topic:'Mathematics',
 sections:[
  {id:'symmetry',title:'Start with triangle symmetries',
   source:'An equilateral triangle has six symmetries: three rotations, including doing nothing, and three reflections. These transformations form a group under composition. Composition means performing one transformation after another.',
   quote:'Composition means performing one transformation after another.',
   summary:'Imagine an equilateral triangle. Rotate it by 120° and it fits its original outline. Reflect it across a symmetry axis and it also fits. These moves, including doing nothing, form a group. We combine moves by doing one after another.',
   steps:['The elements: six moves that preserve the outline.','The operation: compose moves by doing one after another.','The identity: do nothing. Every move has an inverse that undoes it.'],
   change:'Separated the moves, operation and identity. The group elements are transformations, not vertices.',
   recap:'The six symmetries of an equilateral triangle form a group under composition.',
   question:{prompt:'What does composing two symmetries mean?',options:['Adding the number of vertices','Performing one move after the other','Changing the size of the triangle'],correct:1,explanation:'Composition means performing one transformation after another. The result is another symmetry of the triangle.'}},
  {id:'maps',title:'Turn each move into a linear map',
   source:'A representation of a group G on a vector space V is a homomorphism ρ: G → GL(V). Here GL(V) is the group of invertible linear maps from V to itself. The rule is ρ(gh) = ρ(g)ρ(h), and the identity element acts as the identity map. Choosing a basis expresses these maps as matrices.',
   quote:'The rule is ρ(gh) = ρ(g)ρ(h)',
   summary:'A representation lets us study a group using linear algebra. It assigns each group element an invertible linear map. After choosing coordinates, we write these maps as matrices. The rule ρ(gh) = ρ(g)ρ(h) says that combining group elements must match multiplying their matrices. Read ρ as “rho.”',
   steps:['Choose a vector space: a space of vectors on which the group will act.','Assign each group element g an invertible linear map ρ(g).','Preserve composition: ρ(gh) = ρ(g)ρ(h). The identity acts as the identity map.'],
   change:'Unpacked the notation into choices and a rule. Kept invertibility and preservation of composition.',
   recap:'A representation translates group elements into invertible linear maps while preserving composition.',
   question:{prompt:'Which rule must a representation obey?',options:['Every element must have a different matrix','Combining elements must match composing their linear maps','Every matrix must be the identity'],correct:1,explanation:'The essential rule is ρ(gh) = ρ(g)ρ(h). Different elements may have the same image; a representation need not be faithful.'}},
  {id:'rotation',title:'Check the rule with three rotations',
   source:'Center an equilateral triangle at the origin in the real plane. Its symmetries act as invertible linear maps on the plane, giving a two-dimensional real representation. If r is rotation by 120° and R is its matrix, then r³ = e implies R³ = I. Here e is the identity symmetry and I is the 2 × 2 identity matrix.',
   quote:'r³ = e implies R³ = I.',
   summary:'Center the triangle at the origin. Its symmetries now act on vectors in the plane. Let R be the matrix for a 120° rotation. Apply it three times: 120° + 120° + 120° = 360°. Every vector returns to its starting position. So R³ = I, the identity matrix.',
   steps:['One application of R rotates every vector by 120°.','Three applications make a full turn, returning every vector to its starting position.','The group relation r³ = e becomes R³ = I. A full representation must preserve every product, not just this relation.'],
   change:'Expanded the equation into a rotation sequence. Kept the distinction between a group element and its matrix.',
   recap:'The action on the plane gives a representation: three 120° rotations become R³ = I.',
   question:{prompt:'What must R³ equal for this 120° rotation?',options:['The identity matrix I','The zero matrix','Three times R'],correct:0,explanation:'R³ = I because three 120° rotations make a full turn. The identity matrix leaves every vector unchanged; the zero matrix does not.'}}
 ]
};
