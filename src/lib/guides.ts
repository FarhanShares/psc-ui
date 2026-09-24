import type { ServiceType, Species } from './types'

/**
 * Care guides — long-form, indexable content. General guidance only; every
 * guide ends by pointing to a vet, and nothing here replaces one.
 * `updatedDaysAgo` is relative so dates stay current like the rest of the seed.
 */

export type GuideTopic = 'health' | 'nutrition' | 'everyday' | 'visits'

export interface GuideSection {
  id: string
  heading: string
  body: string[]
  list?: string[]
}

export interface Guide {
  slug: string
  title: string
  description: string
  topic: GuideTopic
  species: Species[]
  readMin: number
  updatedDaysAgo: number
  takeaways: string[]
  sections: GuideSection[]
  /** product ids to suggest under the article */
  products?: string[]
  /** clinic service to offer as the next step */
  service?: ServiceType
  related?: string[]
}

export const GUIDE_TOPICS: { id: GuideTopic; label: string; description: string }[] = [
  {
    id: 'health',
    label: 'Health & vaccines',
    description:
      'Puppy and kitten vaccination schedules and a year-round flea and tick plan — plain-English pet health guides you can act on.',
  },
  {
    id: 'nutrition',
    label: 'Food & weight',
    description:
      'Switch your pet’s food without an upset stomach and keep them at a healthy weight — practical food guides for dogs and cats.',
  },
  {
    id: 'everyday',
    label: 'Everyday care',
    description:
      'Brushing teeth at home, and the foods and plants that are toxic to pets — everyday care guides for dogs and cats.',
  },
  {
    id: 'visits',
    label: 'Vet visits',
    description:
      'How to prepare your dog or cat for a calmer vet visit: carriers, what to bring and what to ask — guides from PetSafeCare.',
  },
]

export const GUIDES: Guide[] = [
  {
    slug: 'puppy-vaccination-schedule',
    title: 'Puppy vaccination schedule: what happens in the first year',
    description:
      'When puppies get their core vaccines, why boosters come in a series, which lifestyle vaccines to ask about, and when it is safe to go out.',
    topic: 'health',
    species: ['dog'],
    readMin: 5,
    updatedDaysAgo: 12,
    takeaways: [
      'Core puppy shots come as a series, roughly every 3–4 weeks from about 6–8 weeks old until about 16 weeks.',
      'Rabies is usually given from around 12–16 weeks, depending on local law.',
      'A booster around the first birthday completes the puppy course.',
    ],
    sections: [
      {
        id: 'why-a-series',
        heading: 'Why puppies need a series, not one shot',
        body: [
          'Puppies are born with some protection passed on from their mother. That borrowed immunity fades over the first few months — but while it lingers it can block a vaccine from working, and nobody can tell exactly when it will be gone for a particular puppy.',
          'Giving the core vaccine several times, a few weeks apart, makes sure at least one dose lands after the mother’s protection has faded. That is why the last dose is usually given at around 16 weeks or later.',
        ],
      },
      {
        id: 'core',
        heading: 'The core vaccines',
        body: ['Core vaccines are recommended for every dog, wherever they live:'],
        list: [
          'DHPP (sometimes written DAPP) — distemper, adenovirus (hepatitis), parvovirus and parainfluenza. Given as the puppy series, boosted at about one year, then every one to three years as your vet advises.',
          'Rabies — timing and how often it is repeated are often set by law. Your vet will know the local rules.',
        ],
      },
      {
        id: 'lifestyle',
        heading: 'Lifestyle vaccines to ask about',
        body: [
          'Some vaccines depend on where your dog goes and what they do. Mention walks near water, boarding, daycare, grooming salons and travel plans at the first visit.',
        ],
        list: [
          'Leptospirosis — spread through water and soil contaminated by wildlife urine.',
          'Bordetella (kennel cough) — often required by boarding kennels, daycare and groomers.',
          'Lyme disease — relevant in areas with ticks that carry it.',
        ],
      },
      {
        id: 'going-out',
        heading: 'When can my puppy go outside?',
        body: [
          'Until the course is finished, avoid places where lots of unknown dogs go — parks, pet-shop floors, busy pavements. Your own garden and carrying your puppy around to meet the world are both fine, and early socialisation matters a great deal.',
          'Puppy classes that ask for proof of a first vaccination and clean their floors are generally considered a reasonable balance. Ask your vet what they suggest for your area.',
        ],
      },
      {
        id: 'keeping-track',
        heading: 'Keeping track',
        body: [
          'Write down every dose and the date of the next one. If your clinic is linked, PetSafeCare shows each vaccine as up to date, due soon or overdue, and reminds you two weeks before a due date.',
        ],
      },
    ],
    products: ['p03', 'p05', 'p08'],
    service: 'vaccination',
    related: ['preparing-for-a-vet-visit', 'flea-and-tick-prevention'],
  },
  {
    slug: 'kitten-vaccination-schedule',
    title: 'Kitten vaccinations: a simple first-year plan',
    description:
      'The core FVRCP course, rabies, when FeLV matters, and what indoor-only cats still need — explained without the jargon.',
    topic: 'health',
    species: ['cat'],
    readMin: 4,
    updatedDaysAgo: 20,
    takeaways: [
      'FVRCP is given every 3–4 weeks from about 6–8 weeks old until about 16 weeks.',
      'FeLV is strongly recommended for kittens, even if they will live indoors.',
      'Indoor cats still need core vaccines — viruses travel on shoes and clothes.',
    ],
    sections: [
      {
        id: 'fvrcp',
        heading: 'FVRCP: the core combination',
        body: [
          'FVRCP protects against feline viral rhinotracheitis (a herpesvirus), calicivirus and panleukopenia (feline distemper). Like puppies, kittens get it as a series because protection from their mother fades at an unpredictable time.',
          'After the kitten series there is a booster at about one year, then your vet will suggest a schedule — often every one to three years.',
        ],
      },
      {
        id: 'rabies',
        heading: 'Rabies',
        body: [
          'Rabies vaccination is recommended for cats in many areas and required by law in some, including for indoor cats. It is usually given from around 12–16 weeks.',
        ],
      },
      {
        id: 'felv',
        heading: 'FeLV (feline leukaemia virus)',
        body: [
          'FeLV spreads through close contact between cats. Kittens are most vulnerable, so many vets recommend two doses for every kitten, then boosters only for cats that go outdoors or live with cats of unknown status.',
          'A simple blood test before the first dose checks that your kitten does not already carry the virus.',
        ],
      },
      {
        id: 'indoor',
        heading: 'What about indoor-only cats?',
        body: [
          'Indoor cats face less risk, not zero. Panleukopenia virus survives for a long time in the environment and can come in on shoes. Cats also escape, need boarding, or move house. Core vaccines are still recommended.',
        ],
      },
    ],
    products: ['p14', 'p02', 'p09', 'p16'],
    service: 'vaccination',
    related: ['preparing-for-a-vet-visit', 'dental-care-at-home'],
  },
  {
    slug: 'switching-pet-food',
    title: 'How to switch your pet’s food without an upset stomach',
    description:
      'A day-by-day plan for changing food over 7–10 days, what is normal along the way, and when to slow down or call the vet.',
    topic: 'nutrition',
    species: ['dog', 'cat'],
    readMin: 3,
    updatedDaysAgo: 6,
    takeaways: [
      'Change food gradually over about 7–10 days.',
      'Slow down if stools soften; go back a step for a few days.',
      'Cats can be stubborn — never let a cat go without eating while you switch.',
    ],
    sections: [
      {
        id: 'plan',
        heading: 'A simple 7–10 day plan',
        body: ['Mix the new food into the old in growing amounts. Stretch each step if your pet is sensitive.'],
        list: [
          'Days 1–2: about a quarter new food, three-quarters old.',
          'Days 3–5: half and half.',
          'Days 6–8: three-quarters new, a quarter old.',
          'Day 9 onwards: all new food.',
        ],
      },
      {
        id: 'normal',
        heading: 'What is normal',
        body: [
          'Slightly softer stools or a little extra wind in the first few days are common. If it happens, stay on the current step until things settle before moving on.',
        ],
      },
      {
        id: 'cats',
        heading: 'Extra care with cats',
        body: [
          'Cats can refuse a new food outright. A cat that stops eating for more than a day or so can become seriously unwell, so never "wait it out". Go more slowly, warm wet food slightly, and ask your vet if your cat is refusing meals.',
        ],
      },
      {
        id: 'when-to-call',
        heading: 'When to call the vet',
        body: ['Call your vet rather than pushing on if you see any of these:'],
        list: [
          'Vomiting more than once, or diarrhoea lasting more than a day or two',
          'Blood in stools or vomit',
          'Lethargy, or refusing food completely',
        ],
      },
    ],
    products: ['p01', 'p02', 'p03', 'p14'],
    service: 'consultation',
    related: ['healthy-weight', 'toxic-foods'],
  },
  {
    slug: 'flea-and-tick-prevention',
    title: 'Flea and tick prevention: a year-round plan',
    description:
      'Why prevention works better than treatment, how to treat the home as well as the pet, and the dog products that must never be used on cats.',
    topic: 'health',
    species: ['dog', 'cat'],
    readMin: 5,
    updatedDaysAgo: 3,
    takeaways: [
      'Treat every pet in the home on schedule — not just the one scratching.',
      'Most of a flea problem lives in the home, not on the animal.',
      'Never use a dog flea product on a cat. Some contain permethrin, which is highly toxic to cats.',
    ],
    sections: [
      {
        id: 'why',
        heading: 'Why prevention beats treatment',
        body: [
          'By the time you see fleas on a pet, eggs and larvae are usually already in carpets, bedding and sofa cushions. Regular prevention stops that cycle before it starts, and many products also protect against ticks, which can carry diseases.',
        ],
      },
      {
        id: 'products',
        heading: 'Choosing a product',
        body: [
          'Spot-ons, chewable tablets and collars all work when used as directed. Dosing depends on species and body weight, so weigh your pet and pick the matching pack.',
          'Never use a dog product on a cat. Some dog flea treatments contain permethrin, which can cause tremors, seizures and death in cats — even from close contact with a freshly treated dog. If you have both, ask your vet for products that are safe for the household.',
        ],
      },
      {
        id: 'home',
        heading: 'Treating the home',
        body: ['If fleas have already arrived, pair treatment of every pet with a clean-up of their surroundings:'],
        list: [
          'Wash pet bedding on a hot cycle.',
          'Vacuum carpets, rugs and upholstery daily for a couple of weeks, and empty the vacuum outside.',
          'Keep treating on schedule for at least three months — new fleas keep hatching from pupae for weeks.',
        ],
      },
      {
        id: 'ticks',
        heading: 'Checking for ticks',
        body: [
          'After walks in long grass or woodland, run your hands over your dog’s head, ears, armpits and between the toes. Remove ticks with a tick hook, twisting gently without squeezing the body, and ask your vet if the area stays red or swollen.',
        ],
      },
    ],
    products: ['p11', 'p06', 'p07'],
    service: 'consultation',
    related: ['puppy-vaccination-schedule', 'kitten-vaccination-schedule'],
  },
  {
    slug: 'dental-care-at-home',
    title: 'Dental care at home for dogs and cats',
    description:
      'How to start tooth brushing, which toothpaste to use (never human), what chews can and cannot do, and signs that it is time for a professional clean.',
    topic: 'everyday',
    species: ['dog', 'cat'],
    readMin: 4,
    updatedDaysAgo: 30,
    takeaways: [
      'Daily brushing is the single most effective thing you can do at home.',
      'Use pet toothpaste only — human toothpaste can contain xylitol and fluoride.',
      'Bad breath, red gums or dropping food are reasons to book a dental check.',
    ],
    sections: [
      {
        id: 'brushing',
        heading: 'Start brushing slowly',
        body: [
          'Begin by letting your pet lick a little pet toothpaste from your finger. Over a week or two, move to rubbing the outer surfaces of the teeth with a finger brush, then a soft toothbrush. Short, positive sessions beat one big struggle.',
          'Focus on the outside of the back teeth, where plaque builds up fastest. Most pets will not let you brush the inside surfaces, and that is fine.',
        ],
      },
      {
        id: 'toothpaste',
        heading: 'Never use human toothpaste',
        body: [
          'Human toothpaste is meant to be spat out. Pets swallow it, and some brands contain xylitol, which is dangerous to dogs. Pet toothpastes are safe to swallow and come in flavours animals actually like.',
        ],
      },
      {
        id: 'chews',
        heading: 'Chews, powders and toys',
        body: [
          'Dental chews, food additives and rope toys can help reduce plaque between brushings, but none of them replace brushing. Choose chews sized for your dog, supervise chewing, and count them in the day’s calories.',
        ],
      },
      {
        id: 'signs',
        heading: 'Signs of dental disease',
        body: ['Book a dental check if you notice:'],
        list: [
          'Persistent bad breath',
          'Red or bleeding gums, or brown build-up at the gum line',
          'Chewing on one side, dropping food, or pawing at the mouth',
          'Loose or broken teeth',
        ],
      },
    ],
    products: ['p15', 'p13', 'p08'],
    service: 'dental',
    related: ['healthy-weight', 'preparing-for-a-vet-visit'],
  },
  {
    slug: 'toxic-foods',
    title: 'Foods and plants that are toxic to dogs and cats',
    description:
      'The common household foods and plants that poison pets — chocolate, grapes, xylitol, onions, lilies and more — and exactly what to do if your pet eats one.',
    topic: 'everyday',
    species: ['dog', 'cat'],
    readMin: 4,
    updatedDaysAgo: 9,
    takeaways: [
      'If your pet eats something toxic, call a vet straight away — don’t wait for symptoms.',
      'Lilies are extremely dangerous to cats, even pollen or vase water.',
      'Xylitol, a sweetener in sugar-free gum and some peanut butters, is dangerous to dogs in small amounts.',
    ],
    sections: [
      {
        id: 'foods',
        heading: 'Foods to keep out of reach',
        body: ['These are among the most common causes of poisoning in pets:'],
        list: [
          'Chocolate, cocoa and coffee — dark and baking chocolate are the most dangerous.',
          'Grapes, raisins, sultanas and currants — can cause kidney failure in dogs.',
          'Xylitol (birch sugar) — in sugar-free gum, sweets, some peanut butters and baked goods.',
          'Onions, garlic, leeks and chives — raw, cooked or powdered.',
          'Macadamia nuts (dogs), alcohol, and raw bread dough.',
        ],
      },
      {
        id: 'plants',
        heading: 'Plants and household items',
        body: [
          'True lilies (Lilium) and daylilies can cause fatal kidney failure in cats — every part of the plant, including pollen and the water in the vase. The safest choice is to keep them out of homes with cats.',
        ],
        list: [
          'Human medicines — especially painkillers such as ibuprofen and paracetamol',
          'Antifreeze, rodent bait and slug pellets',
          'Dog flea treatments on cats (see the flea guide)',
        ],
      },
      {
        id: 'what-to-do',
        heading: 'If your pet eats something',
        body: [
          'Call a vet or an animal poison helpline immediately, even if your pet seems fine — many poisons take hours to show symptoms, and early treatment works best. Have the packaging to hand.',
          'Don’t try to make your pet vomit unless a vet tells you to. It can make some poisonings worse.',
        ],
      },
    ],
    products: ['p04', 'p05', 'p09'],
    service: 'consultation',
    related: ['switching-pet-food', 'flea-and-tick-prevention'],
  },
  {
    slug: 'healthy-weight',
    title: 'Keeping your pet at a healthy weight',
    description:
      'How to check body condition at home with your hands, how to measure food properly, and how treats quietly add up.',
    topic: 'nutrition',
    species: ['dog', 'cat'],
    readMin: 4,
    updatedDaysAgo: 15,
    takeaways: [
      'You should be able to feel the ribs easily under a thin layer of fat.',
      'Weigh food rather than using a scoop by eye.',
      'Keep treats to about a tenth of daily calories.',
    ],
    sections: [
      {
        id: 'check',
        heading: 'The hands-on check',
        body: ['You don’t need scales to spot a trend. Once a month, check:'],
        list: [
          'Ribs — easy to feel with light pressure, like the back of your hand. If you have to press hard, there is too much cover.',
          'Waist — seen from above, there should be a visible tuck behind the ribs.',
          'Belly — seen from the side, it should rise up towards the back legs rather than hang.',
        ],
      },
      {
        id: 'measure',
        heading: 'Measure, don’t guess',
        body: [
          'Feeding guides on packs are a starting point for an average animal. Weigh the daily amount on kitchen scales, split it into meals, and adjust by around 10% if your pet is gaining or losing weight it shouldn’t.',
          'Log your pet’s weight in PetSafeCare every few weeks — the trend line makes slow changes obvious.',
        ],
      },
      {
        id: 'treats',
        heading: 'Treats count',
        body: [
          'Treats are useful for training, but they add up fast. Keep them to about a tenth of daily calories, break larger treats into small pieces, and use part of the day’s food allowance as rewards.',
        ],
      },
      {
        id: 'when',
        heading: 'When to involve your vet',
        body: [
          'Sudden weight loss or gain, or a change in thirst or appetite, can be a sign of illness rather than diet. Book a check-up before starting a weight-loss plan so your vet can set a safe target.',
        ],
      },
    ],
    products: ['p12', 'p04', 'p01'],
    service: 'checkup',
    related: ['switching-pet-food', 'dental-care-at-home'],
  },
  {
    slug: 'preparing-for-a-vet-visit',
    title: 'Preparing your pet for a calm vet visit',
    description:
      'Carrier training for cats, what to bring, questions worth asking, and small habits that make every future visit easier.',
    topic: 'visits',
    species: ['dog', 'cat'],
    readMin: 3,
    updatedDaysAgo: 4,
    takeaways: [
      'Leave the cat carrier out at home so it becomes furniture, not a warning sign.',
      'Bring records, a list of medicines and your questions.',
      'Ask about fasting before any procedure — the clinic will tell you.',
    ],
    sections: [
      {
        id: 'carrier',
        heading: 'Make the carrier boring (cats)',
        body: [
          'Many cats only see the carrier on vet day, so they learn to fear it. Leave it out with a soft blanket and the door open, drop treats inside now and then, and it becomes just another place to nap.',
          'On the day, cover the carrier with a light towel and carry it level and close to your body.',
        ],
      },
      {
        id: 'bring',
        heading: 'What to bring',
        list: [
          'Vaccination records or your pet’s passport (or open PetSafeCare)',
          'Names and doses of any medicines or supplements',
          'A fresh stool sample if the clinic asked for one',
          'Photos or a short video of any odd behaviour — it rarely happens on cue',
        ],
        body: [],
      },
      {
        id: 'questions',
        heading: 'Questions worth asking',
        list: [
          'Is my pet at a healthy weight?',
          'Which vaccines are due next, and which lifestyle vaccines make sense for us?',
          'What flea, tick and worming routine do you recommend?',
          'Is there anything I should watch for at home?',
        ],
        body: [],
      },
      {
        id: 'after',
        heading: 'Afterwards',
        body: [
          'Give your pet a quiet space and a small treat at home. Visits that end calmly make the next one easier. Rate your visit in PetSafeCare to help other pet parents choose a clinic.',
        ],
      },
    ],
    products: ['p04', 'p16', 'p06'],
    service: 'checkup',
    related: ['puppy-vaccination-schedule', 'kitten-vaccination-schedule'],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function guidesFor(species: Species): Guide[] {
  return GUIDES.filter((g) => g.species.includes(species))
}
