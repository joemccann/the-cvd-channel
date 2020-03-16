//
// https://gist.github.com/nicbell/6081098
// Returns true if same; false if different
//
const objectCompare = (a = {}, b = {}) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

module.exports = {
  objectCompare
}
