/* Biology bosses — HP duels, one per module plus the Final Paper.

   Replaces Biosphere's 20-question / 75% module bosses (the upgrade every
   StudyQuest subject gets). Each boss keeps Biosphere's unlock rule — answer 30
   questions from its module first — and has one gimmick. The Final Paper opens
   when all eight are beaten. No reference sheet in any boss.

   gimmick:
     shield   every 4th hit you land is absorbed (0 damage)
     heal     every 3rd question the boss regenerates HP
     rotate   the answer options rotate position every few seconds
     drain    the clock tightens as the boss's HP falls
     lifesteal a wrong answer heals the boss by the damage it deals you
     obscure  module and topic labels are hidden
     double   wrong answers hit you for double damage
     chronic  you lose a little HP on every question, right or wrong
     all      the Final Paper: heal + double + obscure + drain */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.bosses = [
  { id: "b-M1", mod: "M1", icon: "🧫", name: "The Membrane", hp: 120, playerHp: 100, seconds: 26, gimmick: "shield",
    taunt: "Nothing crosses me without permission.",
    gimmickText: "Selectively permeable: every 4th hit you land is absorbed." },
  { id: "b-M2", mod: "M2", icon: "🫀", name: "The Vascular Hydra", hp: 125, playerHp: 100, seconds: 26, gimmick: "heal",
    taunt: "Cut one vessel and two more take its place.",
    gimmickText: "Every 3rd question it regenerates 12 HP." },
  { id: "b-M3", mod: "M3", icon: "🦎", name: "The Mimic", hp: 130, playerHp: 100, seconds: 26, gimmick: "rotate",
    taunt: "Look again. Was I always there?",
    gimmickText: "Camouflage: the options rotate position every 4 seconds." },
  { id: "b-M4", mod: "M4", icon: "🦅", name: "The Apex Predator", hp: 135, playerHp: 100, seconds: 24, gimmick: "drain",
    taunt: "The food web narrows. So does your time.",
    gimmickText: "The clock tightens as the predator's HP falls." },
  { id: "b-M5", mod: "M5", icon: "🧬", name: "Mendel's Ghost", hp: 140, playerHp: 100, seconds: 26, gimmick: "lifesteal",
    taunt: "Every error you make, I inherit.",
    gimmickText: "A wrong answer heals the ghost by the damage it deals you." },
  { id: "b-M6", mod: "M6", icon: "☢️", name: "The Mutagen", hp: 145, playerHp: 100, seconds: 26, gimmick: "obscure",
    taunt: "Which gene was it? You will not be told.",
    gimmickText: "Module and topic labels are hidden — identify the biology yourself." },
  { id: "b-M7", mod: "M7", icon: "🦠", name: "The Plague Lord", hp: 150, playerHp: 100, seconds: 25, gimmick: "double",
    taunt: "One exposure is all it takes.",
    gimmickText: "Virulent: wrong answers hit you for double damage." },
  { id: "b-M8", mod: "M8", icon: "🩺", name: "The Silent Tumour", hp: 155, playerHp: 100, seconds: 25, gimmick: "chronic",
    taunt: "You will not feel me until it is too late.",
    gimmickText: "Chronic: you lose 3 HP on every question, right or wrong." },
  { id: "b-final", mod: null, icon: "📜", name: "The Final Paper", hp: 240, playerHp: 100, seconds: 21, gimmick: "all",
    taunt: "Three hours. Eight modules. No data sheet.",
    gimmickText: "Every module, labels hidden, double damage, it heals, and the clock tightens. Beat all eight module bosses first." }
];
