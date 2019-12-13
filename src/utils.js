const colors = [
  "orange",
  "orangered",
  "yellowgreen",
  "purple",
  "blueviolet",
  "brown",
  "cadetblue",
  "chocolate",
  "coral",
  "cornflowerblue",
  "crimson",
  "darkcyan",
  "darkorange",
  "darkmagenta",
  "darksalmon",
  "deeppink",
  "firebrick"
].sort(() => 0.5 - Math.random());

var idx = 0;

export const getColor = () => {
  idx = (idx + 1) % colors.length;
  return colors[idx];
};
