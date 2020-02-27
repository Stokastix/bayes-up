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

export const computeScore = p => {
  if (p < 0.01) return -10;
  if (p < 0.06) return -8;
  const loss = x => -Math.log2(Math.max(x, 0.02));
  const score = (10 * (loss(1 / 4) - loss(p))) / (loss(1 / 4) - loss(1));
  return Math.round(10 * score) / 10;
};
