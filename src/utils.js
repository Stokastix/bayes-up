const colors = [
  "orange",
  "orangered",
  "yellowgreen",
  "blueviolet",
  "cadetblue",
  "chocolate",
  "coral",
  "cornflowerblue",
  "crimson",
  "darkcyan",
  "darkorange",
  "darksalmon",
  "deeppink",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "powderblue",
  "pink",
  "sandybrown",
  "skyblue",
  "springgreen",
  "steelblue",
  "tan",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "yellow",
  "yellowgreen"
];

var idx = -1;
export const getColor = () => {
  const newIdx = Math.floor(Math.random() * colors.length);
  if (newIdx === idx) return getColor();
  idx = newIdx;
  return colors[idx];
};

export const httpGet = url => {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
};

export const shuffle = a => {
  const array = [...a];
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const shortID = n => {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return new Array(n)
    .fill(0)
    .map(_ => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join("");
};

export const computeScore = (p, k) => {
  if (p < 0 || p > 1) console.error("p should be a probability");
  const loss = x => -Math.log2(Math.max(x, 0.02));
  const score = (10 * (loss(1 / k) - loss(p))) / (loss(1 / k) - loss(1));
  return Math.round(10 * score) / 10;
};

export const generateSteps = rawSteps => {
  // TODO this function does not allow nested RANDOMs

  const steps = [];
  for (var i = 0; i < rawSteps.length; i++) {
    if (rawSteps[i][0] === "RANDOM") {
      const r = Number(rawSteps[i][1]);
      const z = i + 1 + Math.floor(Math.random() * r);
      steps.push(rawSteps[z].filter(x => !!x));
      i += r;
    } else {
      steps.push(rawSteps[i].filter(x => !!x));
    }
  }

  return steps;
};
