// *changes: new file - mock service catalogue for the prepare payment endpoint (L5)
// the server uses these prices, never a price sent by the client
const services = [
  { id: 1, name: 'Vaccination', price: 35 },
  { id: 2, name: 'Pet Grooming', price: 50 },
  { id: 3, name: 'Boarding', price: 80 }
];

module.exports = services;
