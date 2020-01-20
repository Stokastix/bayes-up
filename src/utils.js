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

var idx = -1
export const getColor = () => {
  const newIdx = Math.floor(Math.random() * colors.length);
  if (newIdx === idx) return getColor();
  idx = newIdx
  return colors[idx];
};

export const httpGet = url => {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send(null);
  return xmlHttp.responseText;
};

export const shortID = n => {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return new Array(n)
    .fill(0)
    .map(_ => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join("");
};
