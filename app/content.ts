// Everything the page says below the hero. Only confirmed facts go in here.

// Paste a URL the day it goes live. Anything left empty shows its status instead of a dead link.
export const links = {
  register: "", // Luma event page
  // "Contact us" and "Reach out to sponsor" always open the site's own forms, whose messages go to /portal.
  contact: "", // mailto:, shown as "Email us" on the Contact form once it's live
  rules: "",
  discord: "",
  instagram: "",
};

export const sections = ["About", "Tracks", "Schedule", "Sponsors", "FAQ"];

// The bar and its menu.
export const bar = {
  brand: "GrandHacks",
  home: "GrandHacks home",
  nav: "Main navigation",
  open: "Open menu",
  menu: "Menu",
  dialog: "Navigation",
  register: "Register",
};

/* ---------- About ---------- */
export type Step = { icon: "team" | "laptop" | "demo" | "trophy"; title: string; line: string };

const steps: Step[] = [
  { icon: "team", title: "Form a team", line: "Bring friends, find teammates there, or go solo." },
  { icon: "laptop", title: "Build all night", line: "Software, hardware, or anything else that fits this year’s theme." },
  { icon: "demo", title: "Show the judges", line: "On Sunday, you demo what you made." },
  { icon: "trophy", title: "Win an award", line: "There are six, including Best Hardware Hack and Best Solo Hack." },
];

// Dates, times and the full list of awards each have their own place on the page.
export const about = {
  title: "Overnight Hackathon in\u00a0San\u00a0Francisco for middle and high schoolers",
  lead: "Build something of your own from Saturday morning to Sunday morning. No experience needed.",
  steps,
  // the title, lead and steps leave these to the bar, so the section says each once
  stats: [
    ["200+", "students"],
    ["24", "hours to build"],
    ["1–5", "per team"],
    ["Free", "to attend"],
    ["$10K+", "in prizes"],
  ],
};

/* ---------- Tracks ---------- */
export type Track = {
  icon: "ai" | "code" | "chip" | "robot" | "game" | "rocket" | "heart" | "star";
  name: string;
  line: string;
  also?: string;
};

const trackRows: Track[] = [
  { icon: "ai", name: "AI", line: "Models, agents, and smart tools." },
  { icon: "code", name: "Software", line: "Apps, sites, and tools people use." },
  { icon: "chip", name: "Hardware", line: "Circuits, sensors, and gadgets.", also: "Also up for Best Hardware Hack." },
  { icon: "robot", name: "Robotics", line: "Machines that move, sense, and react.", also: "Also up for Best Hardware Hack." },
  { icon: "game", name: "Games", line: "Anything playable." },
  { icon: "rocket", name: "Entrepreneurship", line: "A product with a pitch behind it." },
  { icon: "heart", name: "Social good", line: "Fixes for problems in your community." },
  { icon: "star", name: "Something else?", line: "Have a different angle on the theme? Surprise the judges." },
];

export const tracks = {
  title: ["Build ", "anything", " that fits the theme."],
  label: "This year’s theme",
  // The theme is a secret until then, so it stays out of this file too: everything here ships to the browser.
  theme: "Revealed on the day of the hackathon.",
  group: "Tracks. Pick one to preview it",
  rows: trackRows,
};

/* ---------- The visitor ---------- */
// Held in memory for this visit only. Nothing a visitor types is stored or sent anywhere.
export type Story = { name: string };
export type Tell = (next: Partial<Story>) => void;

export const firstStory: Story = { name: "" };

/* ---------- The name tag ---------- */
export const tag = {
  mark: "GRANDHACKS",
  label: "First name or nickname",
  placeholder: "Your name",
  role: "GrandHacks Attendee",
  when: "June 19–20, 2027",
  where: "San Francisco",
  notTicket: links.register ? "Not a ticket. Register on Luma." : "Not a ticket. Registration opens on Luma.",
};

// Letters, spaces, and the marks names use, plus up to four digits so a team number fits
// but a phone number doesn't.
export const cleanName = (value: string) => {
  let digits = 0;
  return value
    .replace(/[^\p{L}\p{M}\p{Nd} '’.-]/gu, "")
    .replace(/\p{Nd}/gu, (d) => (++digits > 4 ? "" : d))
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 14);
};

/* ---------- Schedule ---------- */
// Local minutes from midnight on June 19. Sunday continues on the same clock.
const SUNDAY = 24 * 60;
export const SUNSET = 20 * 60 + 34;
export const SUNRISE = SUNDAY + 5 * 60 + 48;

type Stamp = { at: number; until?: number; what: string };

export const building = { at: 10 * 60, until: SUNDAY + 10 * 60, what: "Project building" };

export const stamps: Stamp[] = [
  { at: 8 * 60 + 30, until: 9 * 60 + 15, what: "Check-in" },
  { at: 9 * 60 + 15, until: building.at, what: "Opening ceremony" },
  building,
  { at: 11 * 60, until: 11 * 60 + 30, what: "Workshop 1" },
  { at: 12 * 60, until: 12 * 60 + 30, what: "Workshop 2" },
  { at: 13 * 60, what: "Lunch" },
  { at: 15 * 60, until: 15 * 60 + 30, what: "Workshop 3" },
  { at: 16 * 60, what: "Afternoon snacks" },
  { at: 17 * 60, what: "Mentor office hours" },
  { at: 19 * 60, what: "Dinner" },
  { at: SUNDAY, what: "Midnight snacks" },
  { at: SUNDAY + 8 * 60, what: "Breakfast" },
  { at: building.until, until: SUNDAY + 12 * 60 + 30, what: "Demos and judging" },
  { at: SUNDAY + 12 * 60 + 30, until: SUNDAY + 13 * 60, what: "Closing ceremony and prizes" },
  { at: SUNDAY + 13 * 60, what: "Event ends" },
];

// Headings are [before, accent word, after]; the middle word is set in the accent serif.
export const schedule = {
  title: ["You stay the ", "night", "."],
  care: "Sleeping arrangements and the overnight supervision plan get published before the event.",
  careLink: "For parents",
  ruler: "Explore the event schedule, Pacific time",
};

/* ---------- Prizes ---------- */
// `prize` is what the award wins, as it should read on the page. Leave it "" to show "TBD".
export type Place = { place: string; title: string; prize: string };
export type Award = { icon: "chip" | "bulb" | "solo"; title: string; line: string; prize: string };

export const prizes = {
  title: "Six ways to win.",
  text: "Every project is in the running for the top three, and three category awards go on top.",
  top: "Top 3 overall",
  categories: "Category awards",
  total: "Total prize pool",
  pool: "$10K+",
  tba: "TBD",
  // Set true while the prizes below are made-up placeholders, and the page will say so.
  examples: false,
  examplesNote: "Example prizes, for layout only. The real list is announced soon.",
};

// In order of finish. The page stands them 2, 1, 3 like a podium, but they're read 1, 2, 3.
export const places: Place[] = [
  { place: "1", title: "1st place", prize: "" },
  { place: "2", title: "2nd place", prize: "" },
  { place: "3", title: "3rd place", prize: "" },
];

export const awards: Award[] = [
  { icon: "chip", title: "Best Hardware Hack", line: "For the best hardware or robotics project.", prize: "" },
  { icon: "bulb", title: "Most Innovative Hack", line: "For the idea nobody else thought of.", prize: "" },
  { icon: "solo", title: "Best Solo Hack", line: "For the best project built by one person.", prize: "" },
];

/* ---------- Sponsors ---------- */
export const sponsors = {
  title: ["Sponsors make it ", "free", "."],
  text: "GrandHacks is free for every student. Sponsors make that possible, covering food, hardware, and prizes for 200+ young builders in San Francisco.",
  ask: "What would you like to support?",
  chips: ["Meals", "Prizes", "Hardware", "Workshops", "Swag", "Something else"],
  picked: "You picked: ",
  none: "nothing yet",
  cta: "Reach out to sponsor",
  slot: "Your logo here",
  slots: "Open sponsor spots",
};

/* ---------- Questions ---------- */
// The home page's four questions. Families get the long list on /parents, in `parentTopics` below.
const homeRows: [string, string][] = [
  ["Who can attend?", "Any middle or high school student. No experience needed."],
  ["How much does it cost?", "Nothing. GrandHacks is free to attend."],
  [
    "Do I need a team?",
    "Teams can have 1 to 5 people. Come with friends, find teammates at the event, or build solo and compete for Best Solo Hack.",
  ],
  [
    "What if this is my first hackathon?",
    "You’re in the right place. Start with a small idea, build it with your team, and aim for something you can demo on Sunday.",
  ],
];

// Headings are [before, accent word, after]; the middle word is set in the accent serif.
export const questions = {
  title: ["Got ", "questions", "?"],
  text: "Can’t find your answer here? Reach the organizers directly.",
  rows: homeRows,
  parents: "Info for parents",
  contact: "Contact us",
};

/* ---------- For parents (/parents) ---------- */
// The questions families ask, by topic. An answer gives what's confirmed, what's usual at overnight
// hackathons (and says that it's usual), and what a family can do about it now. `tbc` is the part the
// organizers haven't settled: shorten or delete it, and firm up the answer, once they have.
// `id` is the answer's own link (/parents/#sleeping), `list` sets points under the answer, `keys` are
// extra words the search box matches, and `ask` ends the answer with a Contact us button.
export type ParentAsk = {
  id: string;
  q: string;
  a: string;
  list?: string[];
  tbc?: string;
  keys?: string;
  ask?: boolean;
};
export type ParentTopic = {
  id: string;
  title: string;
  icon: "bulb" | "heart" | "moon" | "sun" | "laptop" | "star" | "trophy" | "team" | "solo";
  asks: ParentAsk[];
};

export const parentTopics: ParentTopic[] = [
  {
    id: "about",
    title: "About the event",
    icon: "bulb",
    asks: [
      {
        id: "what-is-a-hackathon",
        q: "What is a hackathon?",
        a: "An event where people build a project from scratch in a set amount of time, usually in small teams. “Hack” here means making something quickly and creatively. It has nothing to do with breaking into computers. At GrandHacks, students get 24 hours and a theme that’s revealed on the day. On Sunday, they show their projects to the judges.",
        keys: "hack hacking explain meaning theme idea project build",
      },
      {
        id: "weekend-schedule",
        q: "What does the weekend look like?",
        a: "All times are Pacific.",
        list: [
          "Check in Saturday from 8:30 to 9:15 AM. The opening ceremony runs from 9:15 to 10 AM.",
          "Teams build from 10 AM Saturday to 10 AM Sunday. Saturday workshops run from 11 to 11:30 AM, noon to 12:30 PM, and 3 to 3:30 PM. Mentor office hours begin at 5 PM.",
          "On Sunday, demos and judging run from 10 AM to 12:30 PM.",
          "The closing ceremony and prizes run from 12:30 to 1 PM Sunday.",
        ],
        keys: "schedule agenda timetable plan itinerary workshop workshops opening ceremony hours saturday sunday time times",
      },
      {
        id: "who-can-attend",
        q: "Who can attend?",
        a: "Any middle or high school student, with any amount of experience. Nobody needs a team or a project idea before they arrive. If your child’s situation is less clear, such as homeschooling, graduating this June or being between schools, ask us and we’ll tell you whether they’re eligible.",
        keys: "age ages grade grades 6th 7th 8th 9th 10th 11th 12th eligible eligibility middle high school homeschool sibling siblings brother sister",
        ask: true,
      },
      {
        id: "experience",
        q: "Does my child need coding experience?",
        a: "No. First-timers are welcome, and plenty of people build their very first project at a hackathon. Code is also only part of it: a team needs someone to find the problem, sketch the idea, design how it looks, test it and present it to the judges. If your child wants a head start, a free beginner tutorial in the weeks before is plenty.",
        keys: "beginner beginners first time coding code coder programming skill skills new",
      },
      {
        id: "teams",
        q: "Who will my child work with?",
        a: "Other students, in teams of 1 to 5. Your child can come with friends, find teammates at the event or work alone, and Best Solo Hack is one of the awards. They’ll be one of 200+ middle and high school students. If working with a certain age group matters to you, the surest way is for your child to arrive with a team they already know.",
        keys: "team teams teammate teammates friend friends solo alone group partner people others older younger age",
      },
      {
        id: "when-and-where",
        q: "When and where is it?",
        a: "In San Francisco, from 8:30 AM on Saturday, June 19 to 1 PM on Sunday, June 20, 2027. You can plan around those times now: be in the city for check-in on Saturday morning, and back for pickup when the awards finish on Sunday afternoon.",
        tbc: "the exact venue and its address.",
        keys: "date dates day days time times long length hours venue location address place san francisco sf june weekend saturday sunday",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & supervision",
    icon: "heart",
    asks: [
      {
        id: "supervision",
        q: "How is the event supervised?",
        a: "An overnight supervision plan will be published before the event, so you can read it before your child walks in. These are the things worth checking in it, and you can ask us about any of them today:",
        list: [
          "Who is in charge, and which adults are awake through the night.",
          "How the doors are watched, and who is allowed inside.",
          "How students are signed in and signed out.",
          "Where students rest, and who keeps an eye on those rooms.",
          "What happens, and who calls you, if someone is hurt or unwell.",
        ],
        tbc: "staffing for the night. It depends partly on the venue.",
        keys: "supervision supervised supervise supervisor safe safety adult adults chaperone chaperones staff security night watch background door",
        ask: true,
      },
      {
        id: "code-of-conduct",
        q: "Is there a code of conduct?",
        a: "Yes. At student hackathons, a code of conduct usually rules out harassment and bullying, alcohol, drugs, weapons and damage to the venue. It also says how a student can report a problem and what happens to someone who breaks a rule. Read it through with your child, and make sure they know they can always call you first.",
        tbc: "the final wording. It’s published before the event.",
        keys: "rule rules conduct behavior behaviour policy policies bullying harassment alcohol drugs weapons report discipline",
      },
      {
        id: "reaching-your-child",
        q: "Can I reach my child during the event?",
        a: "Your child’s own phone is the simplest way, so send it with a charger and, if you have one, a power bank. Agree on a few check-in times beforehand, such as Saturday dinner, before they rest and Sunday morning. Students lose track of time while they build, so a fixed time works better than “text me”. In an emergency, call 911 first.",
        tbc: "the contact for families to use if a student isn’t answering.",
        keys: "phone phones call calls text texting contact reach emergency emergencies message talk number",
        ask: true,
      },
      {
        id: "photos",
        q: "Will there be photos?",
        a: "It’s safest to assume so. Hackathons usually photograph teams, demos and the awards, and students take plenty of their own. If you’d rather your child didn’t appear in photos, tell us their name before the event, and ask them to step out of group pictures.",
        tbc: "how event photos are used, and how families opt out.",
        keys: "photo photos picture pictures video videos camera media filming social privacy",
        ask: true,
      },
    ],
  },
  {
    id: "sleep",
    title: "Sleep & overnight",
    icon: "moon",
    asks: [
      {
        id: "staying-overnight",
        q: "Do students stay overnight?",
        a: "Yes. GrandHacks runs straight through from 8:30 AM Saturday to 1 PM Sunday, and building carries on through Saturday night. Projects are due at 10 AM Sunday, when demos and judging begin.",
        keys: "overnight night stay staying sleepover all night 24 hours",
      },
      {
        id: "sleeping",
        q: "Where will students sleep?",
        a: "At overnight hackathons, students usually rest in quieter rooms away from the building area, on the floor in their own sleeping bags. There are rarely beds, and most students sleep for part of the night. Pack for that: a sleeping bag or blanket, a pillow and a warm layer. If your child needs a particular setup to sleep, such as a separate or very quiet space, tell us early.",
        tbc: "which rooms are for sleeping, how they’re divided and who supervises them. It depends on the venue.",
        keys: "sleep sleeping sleeps bed beds bag pillow blanket rest nap tired room rooms gender floor shower",
        ask: true,
      },
      {
        id: "staying-up",
        q: "Does my child have to stay up all night?",
        a: "Usually not. At overnight hackathons the night is there for teams who want it, and what gets judged is the project. Teams often take turns resting, and a small idea finished calmly usually demos better than a big one finished at 5 AM. It helps to agree on a rest time with your child, and for them to tell their team at the start.",
        tbc: "quiet hours and rest times.",
        keys: "sleep sleeping stay awake up all night bedtime tired rest nap hours healthy",
      },
      {
        id: "sleeping-gear",
        q: "What should my child bring to sleep?",
        a: "Plan for a floor in a shared room:",
        list: [
          "A sleeping bag or blanket, a pillow and, if there’s space, a thin mat.",
          "An eye mask and earplugs. Some people will be up late.",
          "A hoodie, warm socks and comfortable clothes to sleep in.",
          "A toothbrush, toothpaste, deodorant and face wipes. Don’t count on showers.",
        ],
        keys: "sleep sleeping bag pillow blanket mat pajamas pyjamas toiletries toothbrush shower showers pack bring",
      },
      {
        id: "sleeping-at-home",
        q: "Can my child sleep at home and come back?",
        a: "Ask us before the event. It’s designed as one continuous stay, but projects are due at 10 AM on Sunday, so a student who slept at home could still finish with their team. If that’s what makes the weekend possible for your family, tell us when your child would leave and return, and who would bring them.",
        tbc: "whether students can leave overnight and come back in.",
        keys: "sleep sleeping home leave return come back night not overnight part day only",
        ask: true,
      },
    ],
  },
  {
    id: "food-and-health",
    title: "Food & health",
    icon: "sun",
    asks: [
      {
        id: "meals",
        q: "Are meals provided?",
        a: "Food is one of the things our sponsors support. Saturday lunch is at 1 PM, snacks at 4 PM, and dinner at 7 PM. On Sunday, there are midnight snacks and breakfast at 8 AM. Have your child eat breakfast before check-in, and send a refillable water bottle and a few snacks they like for the middle of the night.",
        tbc: "the menu.",
        keys: "food meal meals eat eating breakfast lunch dinner snack snacks drink drinks water hungry",
      },
      {
        id: "allergies",
        q: "What about allergies or dietary needs?",
        a: "Tell us before the event what your child avoids, how serious it is and what helps if they react. Until the menu is out, plan to pack food you know is safe. For a severe allergy, pack it either way, because shared food and shared tables can carry traces. Your child should keep their own medication on them and tell their teammates where it is.",
        tbc: "the menu, and how allergies and diets are handled.",
        keys: "allergy allergies allergic dietary diet vegetarian vegan halal kosher gluten nut nuts dairy restriction restrictions epipen",
        ask: true,
      },
      {
        id: "medical-needs",
        q: "What if my child has a medical need?",
        a: "Contact us before the event so we can talk it through. You don’t need to put private details in the first message: just say you’d like to discuss a medical need. It helps to have this ready:",
        list: [
          "The condition, and what to watch for overnight.",
          "Medication, doses and times, and whether your child takes it on their own.",
          "Anything in the space that matters, such as access, quiet, light or a fridge.",
          "Two people to call, and your child’s doctor.",
        ],
        tbc: "what first aid is on site, and how medication is stored. In an emergency, call 911.",
        keys: "medical medicine medicines medication medications health condition conditions asthma diabetes epipen inhaler sick illness doctor nurse first aid disability accessibility wheelchair",
        ask: true,
      },
    ],
  },
  {
    id: "getting-there",
    title: "Getting there",
    icon: "solo",
    asks: [
      {
        id: "drop-off-and-pickup",
        q: "How do drop-off and pickup work?",
        a: "Check-in runs from 8:30 to 9:15 AM on Saturday, June 19. Plan to pick up your child at 1 PM on Sunday, June 20, when the closing ceremony ends. Leave extra time for parking in San Francisco, or set up a carpool with another family. After a short night, please arrange a ride home for your child, even if they usually drive.",
        tbc: "the address, the entrance, and who can sign a student in and out.",
        keys: "drop off dropoff drop-off pick up pickup pick-up check in check-in checkin arrive arrival collect parking drive driving transport bus transit bart muni carpool ride home",
      },
      {
        id: "arriving-late-or-leaving-early",
        q: "Can my child arrive late or leave early?",
        a: "Tell us the times and who’s bringing or collecting them, and we’ll let you know how it would work. Arriving late can mean missing the opening ceremony on Saturday morning. Leaving early has a bigger cost: projects are submitted at 10 AM on Sunday and judging follows, so the rest of the team would present without them.",
        tbc: "the sign-in and sign-out procedure.",
        keys: "late early leave leaving arrive arriving part partial miss missing sports game",
        ask: true,
      },
      {
        id: "visiting",
        q: "Can parents visit or come to the awards?",
        a: "Demos and judging run from 10 AM to 12:30 PM Sunday. The closing ceremony and prizes follow until 1 PM. You’ll be coming for pickup around then anyway. During the rest of the event, overnight hackathons usually keep the doors to students and staff, for safety.",
        tbc: "whether families can come in for judging and the awards. It depends on space at the venue.",
        keys: "visit visiting visitor visitors watch attend awards ceremony closing come family families guardian guardians demo",
        ask: true,
      },
    ],
  },
  {
    id: "what-to-bring",
    title: "What to bring",
    icon: "laptop",
    asks: [
      {
        id: "what-to-bring-along",
        q: "What should my child bring?",
        a: "Pack for a sleepover with a laptop, and put a name on everything:",
        list: [
          "A laptop, a phone and both chargers, plus headphones.",
          "A sleeping bag or blanket, a pillow, a hoodie and a change of clothes.",
          "A toothbrush and other toiletries.",
          "A refillable water bottle, snacks and any medication, in its labeled container.",
          "Any hardware they plan to build with.",
          "Leave at home anything valuable they won’t use.",
        ],
        tbc: "the final list, including anything the venue doesn’t allow.",
        keys: "bring pack packing list clothes clothing toiletries shower sleep sleeping bag pillow charger supplies stuff things",
        ask: true,
      },
      {
        id: "laptop",
        q: "Does my child need their own laptop?",
        a: "Plan on bringing one if you can, because most hackathon projects are built on a laptop. It doesn’t need to be new or fast, and a Chromebook is enough for websites and many other projects. If it belongs to a school, check that it works on other Wi-Fi networks and allows the tools they’ll want. Teammates can share too, so if getting a laptop is hard, tell us. It shouldn’t be the reason your child stays home.",
        tbc: "whether there are laptops or hardware to borrow.",
        keys: "laptop laptops computer computers device devices chromebook tablet ipad equipment wifi internet borrow loaner hardware",
        ask: true,
      },
    ],
  },
  {
    id: "cost-and-registration",
    title: "Cost & registration",
    icon: "star",
    asks: [
      {
        id: "is-it-free",
        q: "Is it really free?",
        a: "Yes. GrandHacks is free for every middle and high school student, with no fee to register or to take part. Sponsors make that possible. The only costs to plan for are your own, such as getting to San Francisco and back.",
        keys: "free cost costs price prices fee fees pay paying payment money charge ticket tickets",
      },
      {
        id: "registration",
        q: "When does registration open?",
        a: links.register
          ? "Registration is open now, on Luma. It’s free. Register with an email address your family checks, so updates and permission forms reach you."
          : "It isn’t open yet, so you haven’t missed it. Registration will be on Luma, free of charge, and the link will be posted on this site. For now, keep June 19–20, 2027 free, and have your child talk to anyone they’d like on their team.",
        tbc: links.register ? undefined : "the opening date and the deadline.",
        keys: "register registration sign up signup apply application enroll join luma open opens deadline",
      },
      {
        id: "permission-forms",
        q: "When do permission forms arrive?",
        a: "They’re sent to families as the registration deadline gets closer. Expect to need a parent or guardian’s signature, and have the practical details to hand: emergency contacts, allergies, medication and who will collect your child. Register with an email address you check, so the forms don’t get lost.",
        tbc: "the registration deadline.",
        keys: "permission form forms waiver waivers consent sign signature paperwork deadline",
      },
    ],
  },
  {
    id: "learning-and-awards",
    title: "Learning & awards",
    icon: "trophy",
    asks: [
      {
        id: "what-they-get-out-of-it",
        q: "What will my child get out of it?",
        a: "A weekend of learning by doing. Students take an idea from a blank page to something that works, solve problems as they come up, and present what they made to the judges. They practice working with a team, managing their time and explaining their thinking. Whatever happens with the awards, they go home with a project that’s theirs, and can put it in a portfolio or talk about it in an application.",
        keys: "learn learning benefit benefits skill skills why worth value experience grow college resume portfolio",
      },
      {
        id: "prizes",
        q: "Are there prizes?",
        a: "Yes, $10K+ in prizes. There are six awards: first, second and third overall, Best Hardware Hack, Most Innovative Hack and Best Solo Hack. Every project can compete for the top three, whichever track it’s in, and winning doesn’t depend on experience.",
        tbc: "the full list of prizes.",
        keys: "prize prizes award awards win winning winner winners judge judges judging trophy compete competition",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "team",
    asks: [
      {
        id: "contacting-the-organizers",
        q: "How do I contact the organizers?",
        a: "Use Contact us, here or at the end of this page, to send the organizers a message. Choose whether you’d like a reply by email, phone or text, or somewhere else. If it’s about a particular child, mention their grade, so we can give you a useful answer the first time.",
        keys: "contact email organizer organizers organiser organisers question questions help reach talk",
        ask: true,
      },
    ],
  },
];

export const parents = {
  nav: "Parents",
  label: "GrandHacks · June 19–20, 2027",
  title: ["For ", "parents", " and guardians"],
  intro: "GrandHacks is a free overnight hackathon for middle and high school students in San Francisco.",
  why: "It runs from 8:30 AM on Saturday, June 19 to 1 PM on Sunday, June 20, 2027. Students get 24 hours to build a project from scratch, on their own or in a team of up to five, then show it to the judges. No experience is needed. It’s a weekend of learning by doing, and they go home with something they made.",
  facts: [
    { label: "When", value: "June 19–20, 2027", line: "8:30 AM Saturday to 1 PM Sunday" },
    // TBC: the venue.
    { label: "Where", value: "San Francisco", line: "Venue announced soon" },
    { label: "Who", value: "Middle & high schoolers", line: "No experience needed" },
    { label: "Cost", value: "Free", line: links.register ? "Registration is open on Luma" : "Registration opens on Luma" },
  ],
  // on the poster
  poster: ["June", "19–20"],
  pending: "Still being settled: the venue, supervision, menu and sleeping arrangements. Every family will hear before the event.",
  // before an answer's `tbc`
  tbc: "Still being settled:",
  search: "Search the questions",
  hint: "Try “sleep” or “pickup”",
  clear: "Clear search",
  topicsLabel: "Topics",
  all: "All",
  // "29 questions", "5 questions in Sleep & overnight", "1 question matches “sleep”"
  count: (n: number, query: string, topic?: string) =>
    (n === 0 ? "No questions" : n === 1 ? "1 question" : `${n} questions`) +
    (topic ? ` in ${topic}` : "") +
    (query ? `${n === 1 ? " matches" : " match"} “${query}”` : ""),
  none: "Nothing here matches that.",
  noneText: "Try another word, or ask the organizers directly.",
  everywhere: "Search all topics",
  contactTitle: "Still have a question?",
  contactText: "Ask the organizers directly about supervision, health, getting there or anything else.",
  contact: "Contact us",
  back: "Back to the event",
  skip: "Skip to the parents’ guide",
};

/* ---------- Overlays ---------- */
export type Panel = "Registration" | "Sponsorship" | "Contact";

// Registration is a note. Sponsorship and Contact open the forms below, under these titles.
export const panels: Record<Panel, { title: string; text: string }> = {
  Registration: {
    title: "Not yet.",
    text: "Registration will be on Luma and isn’t open yet, so nobody is signed up and you haven’t missed it. The link will be posted here. GrandHacks is free for middle and high school students.",
  },
  Sponsorship: {
    title: "Sponsor GrandHacks",
    text: "Want to support 200+ student builders in San Francisco? Tell us about your organization and what you’d like to support, and the organizers will get back to you.",
  },
  Contact: {
    title: "Contact us",
    text: "Ask the organizers anything about GrandHacks. Tell us how you’d like us to reach you, and we’ll get back to you.",
  },
};

export const overlay = {
  close: "Close overlay",
  calendar: "Add to calendar",
  google: "Google Calendar",
  email: "Email us",
  skip: "Skip to event details",
};

/* ---------- Contact and Sponsor forms ---------- */
// What a visitor sends goes to the organizers' portal and nowhere else. The name tag's name is never in it.
export const forms = {
  roles: ["Student", "Parent or guardian", "Teacher", "Sponsor", "Other"],
  name: "Name",
  yourName: "Your name",
  organization: "Organization",
  optional: "(optional)",
  role: "I’m a…",
  reach: "How should we reach you?",
  methods: { email: "Email", phone: "Phone or text", other: "Other" },
  reachLabel: { email: "Email address", phone: "Phone number", other: "Where we can reach you" },
  reachHint: { email: "name@example.com", phone: "(415) 555-0123", other: "Discord: name" },
  supports: "What you’d like to support",
  message: "Message",
  shortest: "At least 10 characters",
  send: "Send message",
  sending: "Sending…",
  retry: "Try again",
  privacy: "We only use this to reply to you.",
  trap: "Leave this empty",
  thanks: "Thanks!",
  // "We’ll get back to you by email." Another way to reach them is said as they wrote it.
  back: (by: string) => `We’ll get back to you by ${by}.`,
  by: { email: "email", phone: "phone or text" },
  done: "Done",
  // Under a field that needs a fix. The server answers with the same words.
  problems: {
    kind: "This isn’t a form we know.",
    name: "Tell us your name.",
    organization: "Tell us your organization.",
    role: "Choose the one that fits best.",
    method: "Choose how we should reach you.",
    email: "Enter an email address, like name@example.com.",
    phone: "Enter a phone number with at least 7 digits.",
    other: "Tell us where we can reach you.",
    supports: "Choose from the options shown.",
    short: (n: number) => `Write at least ${n} characters.`,
    long: (n: number) => `Keep it to ${n.toLocaleString("en-US")} characters or fewer.`,
  },
  // Above the button when a send didn't go through. The button then says Try again.
  failed: {
    setup: "Sorry, our forms aren’t set up yet, so this can’t be sent right now. Please try again later.",
    busy: "You’ve sent a few messages in a short time. Please wait a few minutes, then try again.",
    network: "We couldn’t reach GrandHacks. Check your connection, then try again.",
    server: "Something went wrong on our side, and your message wasn’t sent. Please try again.",
  },
};

/* ---------- Footer ---------- */
// A row with `panel` opens that overlay; one with `href` links out; the rest show their status.
export const footer = {
  open: "Open",
  line: "Think Grand. Build Bold. © 2027 GrandHacks",
};

export const footerRows: { label: string; status: string; href?: string; panel?: Panel }[] = [
  { label: "Registration", status: "On Luma, not open yet", href: links.register },
  { label: "Contact", status: "Contact us", panel: "Contact" },
  { label: "Rules & policies", status: "Published before the event", href: links.rules },
  { label: "Discord", status: "Not live yet", href: links.discord },
  { label: "Instagram", status: "Not live yet", href: links.instagram },
];

export const calendar = {
  file: "/grandhacks.ics",
  google:
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=GrandHacks%20(reminder%2C%20not%20registered)&dates=20270619T153000Z%2F20270620T200000Z&location=San%20Francisco%2C%20venue%20to%20be%20announced&details=A%20calendar%20reminder.%20It%20does%20not%20register%20you.%20Registration%20will%20be%20on%20Luma.",
};

/* ---------- The organizers' portal (/portal) ---------- */
// Where the Contact and Sponsor messages are read. Nothing on the site links here.
export const portal = {
  title: "Messages | GrandHacks",
  brand: "GrandHacks",
  heading: "Messages",
  loading: "Loading messages…",
  signIn: {
    title: "Organizers only",
    text: "Enter the organizers’ passcode to read the messages sent through the site.",
    label: "Passcode",
    button: "Sign in",
    checking: "Checking…",
    empty: "Enter the passcode.",
    wrong: (left: number) =>
      `That isn’t the passcode. ${left === 1 ? "1 more try" : `${left} more tries`} before a 15-minute pause.`,
    paused: (minutes: number) =>
      `Too many wrong tries from here. Try again in ${minutes === 1 ? "1 minute" : `${minutes} minutes`}.`,
    out: "You’re signed out.",
    ended: "Your session ended. Sign in again to carry on.",
    trouble: "The passcode couldn’t be checked just now. Try again.",
    offline: "The site can’t be reached. Check your connection, then try again.",
    noCookie: "That’s the passcode, but this browser didn’t keep you signed in. Allow cookies for this site, then try again.",
  },
  signOutFailed: "You’re still signed in: the site couldn’t be reached. Try again.",
  setup: {
    title: "Not set up yet",
    text: "The portal needs Upstash Redis, PORTAL_PASSCODE and PORTAL_SECRET. SETUP-FORMS.md in the site’s repository explains how to add them.",
  },
  trouble: {
    title: "Something went wrong",
    offline: "The site can’t be reached. Check your connection, then try again.",
    server: "The messages couldn’t be loaded just now.",
    retry: "Try again",
  },
  fresh: (n: number) => `${n} new`,
  refresh: "Refresh",
  refreshing: "Refreshing…",
  signOut: "Sign out",
  kindLabel: "Form",
  kinds: { all: "All", contact: "Contact", sponsor: "Sponsor" },
  statusLabel: "Status",
  statuses: { new: "New", replied: "Replied", archived: "Archived" },
  search: "Search",
  searchHint: "Names, organizations, contact details or words in a message",
  // "3 new messages", "1 replied message matches “acme”"
  shown: (n: number, status: string, query: string) =>
    `${n === 0 ? "No" : n} ${status.toLowerCase()} ${n === 1 ? "message" : "messages"}` +
    (query ? ` ${n === 1 ? "matches" : "match"} “${query}”` : ""),
  empty: {
    new: "Nothing new. Messages sent through the site’s forms show up here.",
    replied: "Messages you mark as replied show up here.",
    archived: "Messages you archive show up here.",
  },
  noName: "No name given",
  reach: { email: "Email", phone: "Phone or text", other: "Other" },
  replyEmail: "Reply by email",
  // the subject a reply by email starts with
  subject: "Your message to GrandHacks",
  call: "Call",
  text: "Text",
  copy: "Copy",
  copied: "Copied",
  noCopy: "Couldn’t copy. Select it instead.",
  supports: "Would like to support",
  noMessage: "No message.",
  mark: { replied: "Mark as replied", archived: "Archive", new: "Mark as new" },
  remove: "Delete",
  confirm: "Delete this message for good? It can’t be undone.",
  yes: "Delete",
  no: "Keep it",
  // said aloud, and shown briefly, once a change is saved
  done: { replied: "Marked as replied.", archived: "Archived.", new: "Marked as new.", deleted: "Deleted." },
  gone: "That message had already been deleted.",
  failed: "That change wasn’t saved. Try again.",
};
