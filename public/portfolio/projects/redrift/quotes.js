const quotes = [
    "Not yet.",
    "403: Forbidden. Unwritten.",
    "Did you mean to open this?",
    "Don't cast spells you don't know.",
    "March 1, 2016",
    "I'm still alive\nBut something died in me\nAges long ago",
    "Fate isn't so concrete.",
    "I know what you are.",
    "Did'ja just blow in from stupid town?",
    "Beat it, twerp.",
    "There's no room for the two of us.",
    "This stuff ain't safe.",
    "Come back later.",
    "This isn't for you.",
    "Quit it.",
    "You're not supposed to be here.",
    "What, looking for secrets or somethin'?",
    "Hi mom!",
    "We've reached a split point.",
    "Aaaand, cut."
];

const quoteEl = document.getElementById("quote");
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];