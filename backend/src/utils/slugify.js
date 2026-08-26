// Transfòme yon tèks ("Chemiz Ble #1") an yon "slug" pou URL ("chemiz-ble-1").
function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire aksan
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
