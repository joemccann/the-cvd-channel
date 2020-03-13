//
// https://gist.github.com/nicbell/6081098
// Returns true if same; false if different
//
const objectCompare = (a = {}, b = {}) => {
  const s = o => Object.entries(o).sort().map(i => {
    if (i[1] instanceof Object) i[1] = s(i[1]); return i
  })
  return JSON.stringify(s(a)) === JSON.stringify(s(b))
}

module.exports = {
  objectCompare
}
