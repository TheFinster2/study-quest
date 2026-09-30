/* Worked examples for the Reference screen.

   Each one ends with `trap` — the mistake it is specifically guarding against.
   That is the part worth reading twice, and it is why these are worth having
   alongside the generators: a generator shows you the working for the numbers it
   happened to pick, whereas these are chosen because the METHOD is the thing
   students get wrong. */
window.PHYS = window.PHYS || {};
PHYS.DATA = PHYS.DATA || {};

PHYS.DATA.workedExamples = [
  { id: "wex-01", mod: "M1", topic: "Motion in a straight line",
    title: "Two-stage journey with a change of acceleration",
    question: "A train accelerates from rest at 0.80 \\u{m s^-2} for 25 \\u{s}, then travels at " +
              "constant speed for 60 \\u{s}. How far has it gone in total?",
    steps: [
      { eq: "v = u + at = 0 + 0.80 \\times 25 = 20 \\u{m s^-1}", note: "Speed at the end of stage 1." },
      { eq: "s_1 = \\f{1}{2}(u+v)t = \\f{1}{2}(0 + 20)(25) = 250 \\u{m}",
        note: "The average-velocity form is quicker here than ut + ½at²." },
      { eq: "s_2 = vt = 20 \\times 60 = 1200 \\u{m}", note: "Constant speed, so no acceleration term." },
      { eq: "s = 250 + 1200 = 1450 \\u{m}", note: "" }
    ],
    trap: "Applying one suvat equation across BOTH stages. The equations assume uniform " +
          "acceleration, and the acceleration changes at t = 25 s, so each stage must be handled " +
          "separately with the stages linked by the shared speed." },

  { id: "wex-02", mod: "M1", topic: "Vectors",
    title: "Resultant of two non-perpendicular displacements",
    question: "A walker goes 300 \\u{m} on a bearing of 040\\deg, then 400 \\u{m} on a bearing of " +
              "100\\deg. Find the resultant displacement.",
    steps: [
      { eq: "\\text{North: } 300\\cos40\\deg + 400\\cos100\\deg = 229.8 - 69.5 = 160.3 \\u{m}",
        note: "Bearings are measured from north, so the NORTH component uses cos." },
      { eq: "\\text{East: } 300\\sin40\\deg + 400\\sin100\\deg = 192.8 + 393.9 = 586.7 \\u{m}", note: "" },
      { eq: "|\\v{s}| = \\sqrt{160.3^2 + 586.7^2} = 608 \\u{m}", note: "" },
      { eq: "theta = \\tan^-1\\f{586.7}{160.3} = 74.7\\deg", note: "Bearing 075°, to three figures." }
    ],
    trap: "Swapping sin and cos. With bearings the angle is from NORTH, so north = cos and " +
          "east = sin — the opposite of the usual convention where the angle is from the " +
          "horizontal. Write down which convention you are using before you resolve anything." },

  { id: "wex-03", mod: "M2", topic: "Newton's laws",
    title: "Two blocks connected by a string on a table",
    question: "A 3.0 \\u{kg} block on a frictionless table is connected over a pulley to a " +
              "2.0 \\u{kg} block hanging freely. Find the acceleration and the tension.",
    steps: [
      { eq: "\\text{System: } F_{net} = m_2g = 2.0 \\times 9.8 = 19.6 \\u{N}",
        note: "Only the hanging weight is unbalanced; the table block's weight is balanced by the normal force." },
      { eq: "a = \\f{19.6}{3.0 + 2.0} = 3.92 \\u{m s^-2}", note: "Both blocks accelerate, so use the TOTAL mass." },
      { eq: "\\text{Table block: } T = m_1a = 3.0 \\times 3.92 = 11.8 \\u{N}", note: "" },
      { eq: "\\text{Check on the hanging block: } m_2g - T = 19.6 - 11.8 = 7.8 = m_2a ✓", note: "" }
    ],
    trap: "Assuming the tension equals the hanging block's weight. If it did, the hanging block " +
          "would have zero net force and nothing would accelerate. The tension is always LESS " +
          "than the hanging weight whenever the system is accelerating." },

  { id: "wex-04", mod: "M2", topic: "Momentum and collisions",
    title: "Ballistic pendulum — momentum then energy",
    question: "A 12 \\u{g} bullet strikes and embeds in a 2.0 \\u{kg} block hanging on a string. " +
              "The block rises 8.0 \\u{cm}. Find the bullet's speed.",
    steps: [
      { eq: "\\text{Rise: } v_{after} = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 0.080} = 1.252 \\u{m s^-1}",
        note: "Energy applies AFTER the collision, while the block swings up." },
      { eq: "\\text{Collision: } m_bu = (m_b + m_B)v_{after}", note: "Momentum applies DURING the collision." },
      { eq: "u = \\f{2.012 \\times 1.252}{0.012} = 210 \\u{m s^-1}", note: "" }
    ],
    trap: "Using energy conservation for the collision itself. The bullet embeds, so it is " +
          "perfectly inelastic and most of the kinetic energy becomes heat. Momentum for the " +
          "collision, energy for the swing — and never the other way round." },

  { id: "wex-05", mod: "M3", topic: "Refraction",
    title: "Light through a glass block — both surfaces",
    question: "Light hits a glass block (n = 1.50) at 40\\deg to the normal. Find the angle inside " +
              "the glass, and the angle at which it leaves the far face.",
    steps: [
      { eq: "1.00\\sin40\\deg = 1.50\\sin theta_2 \\implies \\sin theta_2 = 0.4285", note: "" },
      { eq: "theta_2 = 25.4\\deg", note: "Bent towards the normal, entering the denser medium." },
      { eq: "\\text{Far face: } 1.50\\sin25.4\\deg = 1.00\\sin theta_3", note: "The faces are parallel." },
      { eq: "theta_3 = 40\\deg", note: "It leaves at exactly the angle it entered — displaced sideways but parallel." }
    ],
    trap: "Thinking the ray keeps bending the same way at the second surface. It bends back by " +
          "the same amount, so a parallel-sided block shifts a ray without changing its " +
          "direction. That is why a window does not distort the view." },

  { id: "wex-06", mod: "M3", topic: "Thermodynamics",
    title: "Mixing two masses of water",
    question: "300 \\u{g} of water at 80 \\u{\\degC} is mixed with 500 \\u{g} at 20 \\u{\\degC}. " +
              "Find the final temperature.",
    steps: [
      { eq: "\\text{Heat lost} = \\text{heat gained}", note: "Nothing escapes to the surroundings." },
      { eq: "0.300c(80 - T) = 0.500c(T - 20)", note: "c cancels — both are water." },
      { eq: "24 - 0.300T = 0.500T - 10 \\implies 0.800T = 34", note: "" },
      { eq: "T = 42.5 \\u{\\degC}", note: "Closer to the cooler water, because there is more of it." }
    ],
    trap: "Averaging the two temperatures to get 50 °C. That is only correct for EQUAL masses. " +
          "The larger mass pulls the final temperature towards itself." },

  { id: "wex-07", mod: "M4", topic: "Circuits",
    title: "A mixed series–parallel network",
    question: "A 12 \\u{V} supply feeds a 4.0 \\u{Ω} resistor in series with two 6.0 \\u{Ω} " +
              "resistors in parallel. Find the current from the supply and the voltage across the " +
              "parallel pair.",
    steps: [
      { eq: "R_{parallel} = \\f{6.0 \\times 6.0}{6.0 + 6.0} = 3.0 \\u{Ω}",
        note: "Two equal resistors in parallel give half of one — worth spotting instantly." },
      { eq: "R_T = 4.0 + 3.0 = 7.0 \\u{Ω}", note: "" },
      { eq: "I = \\f{12}{7.0} = 1.71 \\u{A}", note: "This is the current through the 4.0 Ω resistor." },
      { eq: "V_{parallel} = 1.71 \\times 3.0 = 5.14 \\u{V}",
        note: "Each 6.0 Ω branch carries 5.14/6.0 = 0.857 A, and the two add back to 1.71 A ✓" }
    ],
    trap: "Combining the 4.0 Ω resistor into the parallel calculation. Work from the inside out: " +
          "reduce the parallel section to a single value FIRST, then treat the whole thing as a " +
          "series circuit." },

  { id: "wex-08", mod: "M5", topic: "Projectile motion",
    title: "Projectile launched from a height at an angle",
    question: "A ball is launched at 25 \\u{m s^-1} at 30\\deg above the horizontal from a " +
              "20 \\u{m} cliff. How far from the base does it land?",
    steps: [
      { eq: "u_x = 25\\cos30\\deg = 21.65, \\nbsp u_y = 25\\sin30\\deg = 12.5 \\u{m s^-1}", note: "" },
      { eq: "-20 = 12.5t - 4.9t^2", note: "Taking up as positive, so the landing displacement is −20 m." },
      { eq: "4.9t^2 - 12.5t - 20 = 0 \\implies t = \\f{12.5 + \\sqrt{156.25 + 392}}{9.8}", note: "" },
      { eq: "t = 3.66 \\u{s} \\implies x = 21.65 \\times 3.66 = 79.2 \\u{m}",
        note: "Take the POSITIVE root; the negative one is a time before the launch." }
    ],
    trap: "Using the level-ground range formula R = u²sin2θ/g. It assumes the projectile lands at " +
          "its launch HEIGHT, which is not the case here. Whenever the start and finish heights " +
          "differ, go back to the vertical equation and solve the quadratic." },

  { id: "wex-09", mod: "M5", topic: "Orbits",
    title: "Altitude of a satellite from its period",
    question: "A satellite orbits the Earth with a period of 2.0 hours. Find its altitude above " +
              "the surface. Take GM_E = 4.0 \\times 10^{14} \\u{m^3 s^-2} and " +
              "r_E = 6.371 \\times 10^6 \\u{m}.",
    steps: [
      { eq: "T = 2.0 \\times 3600 = 7200 \\u{s}", note: "" },
      { eq: "r^3 = \\f{GMT^2}{4pi^2} = \\f{4.0 \\times 10^{14} \\times 7200^2}{39.48}", note: "" },
      { eq: "r^3 = 5.25 \\times 10^{20} \\implies r = 8.07 \\times 10^6 \\u{m}", note: "Take the CUBE root." },
      { eq: "h = 8.07 \\times 10^6 - 6.371 \\times 10^6 = 1.70 \\times 10^6 \\u{m} = 1700 \\u{km}", note: "" }
    ],
    trap: "Forgetting the last line. Kepler's law gives r from the CENTRE of the Earth; an " +
          "altitude question wants r − r_E. This single omission is the most common error in the " +
          "whole module." },

  { id: "wex-10", mod: "M5", topic: "Circular motion",
    title: "Car over the crest of a hill",
    question: "At what speed does a car lose contact with the road at the top of a circular crest " +
              "of radius 45 \\u{m}?",
    steps: [
      { eq: "\\text{At the top: } mg - N = \\f{mv^2}{r}",
        note: "Both weight and normal force are vertical; the centripetal direction is downwards." },
      { eq: "\\text{Losing contact means } N = 0", note: "That is the condition the question is really asking for." },
      { eq: "mg = \\f{mv^2}{r} \\implies v = \\sqrt{gr}", note: "The mass cancels." },
      { eq: "v = \\sqrt{9.8 \\times 45} = 21 \\u{m s^-1}", note: "About 76 km h⁻¹." }
    ],
    trap: "Setting N = mg, which is the flat-road case. Over a crest the road pushes up LESS than " +
          "the weight, because a net downward force is needed to curve the path — that is why you " +
          "feel light going over a hump." },

  { id: "wex-11", mod: "M6", topic: "Electromagnetic induction",
    title: "EMF from a rotating coil, and its RMS value",
    question: "A 200-turn coil of area 4.0 \\times 10^{-3} \\u{m^2} rotates at 50 \\u{Hz} in a " +
              "0.35 \\u{T} field. Find the peak and RMS EMF.",
    steps: [
      { eq: "omega = 2pi f = 2pi \\times 50 = 314 \\u{rad s^-1}",
        note: "Convert to ANGULAR frequency; using 50 directly is a factor-of-2π error." },
      { eq: "emf_{peak} = NBA\\omega = 200 \\times 0.35 \\times 4.0 \\times 10^{-3} \\times 314", note: "" },
      { eq: "emf_{peak} = 88 \\u{V}", note: "" },
      { eq: "emf_{rms} = \\f{88}{\\sqrt{2}} = 62 \\u{V}", note: "RMS is what a multimeter reads." }
    ],
    trap: "Using f rather than ω = 2πf. It costs a factor of 6.28, which is large enough that the " +
          "answer looks plausible — so it does not get caught by a sanity check." },

  { id: "wex-12", mod: "M6", topic: "Transformers",
    title: "Transmission losses with and without a transformer",
    question: "20 \\u{kW} is sent 5.0 \\u{km} down a line of resistance 0.40 \\u{Ω km^-1}. Compare " +
              "the loss at 240 \\u{V} with the loss at 11 \\u{kV}.",
    steps: [
      { eq: "R = 0.40 \\times 5.0 = 2.0 \\u{Ω}", note: "" },
      { eq: "\\text{At } 240 \\u{V}: I = \\f{20000}{240} = 83.3 \\u{A}, \\nbsp P_{loss} = I^2R = 13.9 \\u{kW}",
        note: "Nearly 70% of the power lost as heat — unusable." },
      { eq: "\\text{At } 11 \\u{kV}: I = \\f{20000}{11000} = 1.82 \\u{A}, \\nbsp P_{loss} = 6.6 \\u{W}",
        note: "0.03% lost." },
      { eq: "\\text{Ratio} = \\left(\\f{11000}{240}\\right)^2 \\approx 2100", note: "The loss falls as the square of the voltage ratio." }
    ],
    trap: "Using P = V²/R with the TRANSMISSION voltage. That gives the power the line would " +
          "dissipate if it were connected straight across the supply — an enormous and " +
          "meaningless number. For line losses it is always I²R with the LINE's resistance." },

  { id: "wex-13", mod: "M7", topic: "Photoelectric effect",
    title: "Photoelectric effect end to end",
    question: "Light of 250 \\u{nm} falls on a zinc surface (phi = 4.30 \\u{eV}). Find the maximum " +
              "electron kinetic energy, the stopping voltage, and the threshold wavelength.",
    steps: [
      { eq: "E = \\f{hc}{lambda} = \\f{6.626 \\times 10^{-34} \\times 3.00 \\times 10^8}{250 \\times 10^{-9}} = 7.95 \\times 10^{-19} \\u{J}",
        note: "= 4.96 eV." },
      { eq: "E_{k,max} = 4.96 - 4.30 = 0.66 \\u{eV} = 1.06 \\times 10^{-19} \\u{J}", note: "" },
      { eq: "V_s = 0.66 \\u{V}", note: "In electronvolts the stopping voltage and E_k,max are the same number." },
      { eq: "lambda_0 = \\f{hc}{phi} = \\f{1.99 \\times 10^{-25}}{4.30 \\times 1.602 \\times 10^{-19}} = 289 \\u{nm}",
        note: "Longer than 250 nm, so emission does occur ✓" }
    ],
    trap: "Subtracting a work function in eV from a photon energy in joules. Convert one of them " +
          "first. Working entirely in eV and converting once at the end is usually cleanest." },

  { id: "wex-14", mod: "M7", topic: "Special relativity",
    title: "Time dilation and length contraction on the same trip",
    question: "A ship travels 8.0 light years (Earth frame) at 0.80c. How long does the trip take " +
              "in each frame?",
    steps: [
      { eq: "gamma = \\f{1}{\\sqrt{1 - 0.64}} = \\f{1}{0.60} = 1.667", note: "" },
      { eq: "\\text{Earth frame: } t = \\f{8.0}{0.80} = 10 \\text{ years}", note: "Earth's own distance and Earth's own clock." },
      { eq: "\\text{Ship frame: } t_0 = \\f{10}{1.667} = 6.0 \\text{ years}", note: "The ship's clock is the proper time." },
      { eq: "\\text{Check: } l = \\f{8.0}{1.667} = 4.8 \\text{ ly}, \\nbsp \\f{4.8}{0.80} = 6.0 \\text{ years ✓}",
        note: "The ship sees a contracted distance and agrees on its own elapsed time." }
    ],
    trap: "Mixing one frame's distance with the other frame's time. Pick a frame, use ITS distance " +
          "and ITS time, and only then convert. Mixing them gives an answer that is wrong in both " +
          "frames." },

  { id: "wex-15", mod: "M8", topic: "Nuclear physics",
    title: "Energy released in a fusion reaction",
    question: "Find the energy released in " +
              "\\nuc{2}{1}H + \\nuc{3}{1}H \\to \\nuc{4}{2}He + \\nuc{1}{0}n. " +
              "Masses (u): 2.014102, 3.016049, 4.002602, 1.008665.",
    steps: [
      { eq: "\\text{Before} = 2.014102 + 3.016049 = 5.030151 \\u{u}", note: "" },
      { eq: "\\text{After} = 4.002602 + 1.008665 = 5.011267 \\u{u}", note: "" },
      { eq: "Delta m = 0.018884 \\u{u}", note: "Keep every decimal place — the defect is a small difference of large numbers." },
      { eq: "E = 0.018884 \\times 931.5 = 17.6 \\u{MeV}", note: "About 3.5 MeV per nucleon: enormous compared with chemistry." }
    ],
    trap: "Rounding the masses before subtracting. The defect is four orders of magnitude smaller " +
          "than the masses themselves, so rounding to three or four figures destroys it entirely. " +
          "Subtract at full precision, THEN round." },

  { id: "wex-16", mod: "M8", topic: "Radioactivity",
    title: "Dating a sample from its activity",
    question: "A sample's carbon-14 activity is 0.25 of a living sample's. Carbon-14's half-life " +
              "is 5730 years. How old is it?",
    steps: [
      { eq: "\\f{A}{A_0} = 0.25 = \\left(\\f{1}{2}\\right)^n", note: "" },
      { eq: "n = 2 \\text{ half-lives}", note: "Because 0.25 = (½)²." },
      { eq: "t = 2 \\times 5730 = 11460 \\text{ years}", note: "" },
      { eq: "\\text{Or: } lambda = \\f{\\ln 2}{5730}, \\nbsp t = \\f{\\ln 4}{lambda} = 11460 \\text{ years ✓}",
        note: "The exponential form handles non-whole numbers of half-lives too." }
    ],
    trap: "Treating decay as linear — 'a quarter left means three quarters of the way through the " +
          "half-life'. It is exponential: a quarter left is exactly two half-lives, not less than " +
          "one." },

  { id: "wex-17", mod: "M8", topic: "Stars",
    title: "Radius of a star from its luminosity and temperature",
    question: "A star has luminosity 400 times the Sun's and a surface temperature of 4000 \\u{K}. " +
              "The Sun is 5778 \\u{K}. How does its radius compare with the Sun's?",
    steps: [
      { eq: "L = 4pi r^2sigma T^4 \\implies \\f{L}{L_{Sun}} = \\left(\\f{r}{r_{Sun}}\\right)^2\\left(\\f{T}{T_{Sun}}\\right)^4",
        note: "The ratio form removes σ entirely." },
      { eq: "400 = \\left(\\f{r}{r_{Sun}}\\right)^2\\left(\\f{4000}{5778}\\right)^4 = \\left(\\f{r}{r_{Sun}}\\right)^2 \\times 0.2296", note: "" },
      { eq: "\\left(\\f{r}{r_{Sun}}\\right)^2 = 1742 \\implies \\f{r}{r_{Sun}} = 41.7", note: "" },
      { eq: "", note: "Cool but very luminous means very large: a red giant, forty times the Sun's radius." }
    ],
    trap: "Assuming a more luminous star must be hotter. Luminosity depends on size AND " +
          "temperature, which is exactly why the H–R diagram has branches rather than a single line." },

  { id: "wex-18", mod: "M2", topic: "Work and energy",
    title: "Loop-the-loop — the minimum release height",
    question: "From what minimum height must a ball be released to complete a vertical loop of " +
              "radius r on a frictionless track?",
    steps: [
      { eq: "\\text{At the top, minimum condition: } mg = \\f{mv_{top}^2}{r} \\implies v_{top}^2 = gr",
        note: "The track can only push inwards, so gravity alone must supply the centripetal force." },
      { eq: "\\text{Energy: } mgh = mg(2r) + \\f{1}{2}mv_{top}^2", note: "The top of the loop is at height 2r." },
      { eq: "gh = 2gr + \\f{1}{2}gr = 2.5gr", note: "" },
      { eq: "h = 2.5r", note: "Two and a half radii — noticeably higher than the loop itself." }
    ],
    trap: "Assuming the ball only needs to REACH the top, giving h = 2r. At that height it would " +
          "arrive with zero speed and fall off the track. It needs enough speed at the top for " +
          "gravity to be exactly the required centripetal force." },

  { id: "wex-19", mod: "M4", topic: "Electrostatics",
    title: "A charged droplet held stationary between plates",
    question: "An oil droplet of mass 3.2 \\times 10^{-15} \\u{kg} hangs motionless between plates " +
              "1.5 \\u{cm} apart with 480 \\u{V} across them. How many excess electrons does it carry?",
    steps: [
      { eq: "E = \\f{V}{d} = \\f{480}{0.015} = 3.2 \\times 10^4 \\u{V m^-1}", note: "" },
      { eq: "\\text{Motionless: } qE = mg", note: "The electric force exactly balances the weight." },
      { eq: "q = \\f{3.2 \\times 10^{-15} \\times 9.8}{3.2 \\times 10^4} = 9.8 \\times 10^{-19} \\u{C}", note: "" },
      { eq: "n = \\f{9.8 \\times 10^{-19}}{1.602 \\times 10^{-19}} = 6.1 \\approx 6",
        note: "A whole number, as it must be — this is Millikan's experiment." }
    ],
    trap: "Using qV rather than qE for the force. qV is an ENERGY in joules; the force needs the " +
          "field, so the plate separation is essential and cannot be left out." },

  { id: "wex-20", mod: "M3", topic: "Standing waves",
    title: "Finding the speed of sound with a resonance tube",
    question: "A tube closed at one end resonates at its fundamental with a 512 \\u{Hz} fork when " +
              "its air column is 16.4 \\u{cm} long. Find the speed of sound.",
    steps: [
      { eq: "\\text{Closed pipe fundamental: } L = \\f{lambda}{4}",
        note: "A node at the closed end, an antinode at the open end — a QUARTER wavelength fits." },
      { eq: "lambda = 4 \\times 0.164 = 0.656 \\u{m}", note: "" },
      { eq: "v = f lambda = 512 \\times 0.656 = 336 \\u{m s^-1}", note: "" },
      { eq: "", note: "Close to the data sheet's 340 m s⁻¹; the difference is temperature and the end correction." }
    ],
    trap: "Using L = λ/2, which is the fundamental for a pipe open at BOTH ends or a string fixed " +
          "at both ends. A closed pipe fits a quarter wavelength, so it sounds an octave lower " +
          "than an open pipe of the same length." }
];
