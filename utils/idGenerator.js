function padZero(n, length = 4) {
  const s = n.toString();
  return s.padStart(length, '0');
}

function genAccountId(n) {
  const year = new Date().getFullYear();
  return year.toString() + padZero(n);
}

function genCheckId(n) {
  return 'CHECK' + padZero(n);
}

function genCardNumber(n) {
  const randomPart = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return randomPart + padZero(n);
}

function genCVV() {
  return Math.floor(100 + Math.random() * 900);
}

function genExpiryDate() {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = (d.getFullYear() + 4).toString();
  return `${month}/${year}`;
}

module.exports = {
  padZero,
  genAccountId,
  genCheckId,
  genCardNumber,
  genCVV,
  genExpiryDate
};

