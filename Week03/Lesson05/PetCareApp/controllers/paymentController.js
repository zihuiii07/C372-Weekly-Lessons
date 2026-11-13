// *changes: new file - payment controller for L5, GET /payments/prepare/:serviceId
// follows specs/prepare-payment.md: 200 with 5 fields, or 404 if the service is not in the catalogue
const services = require('../data/mockServices');

// Prepare payment details for one service
function preparePayment(req, res) {
  const serviceId = Number(req.params.serviceId);

  // look up the service in the mock catalogue
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // amount always comes from the catalogue, query/body values are not used
  res.status(200).json({
    serviceId: service.id,
    serviceName: service.name,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
}

module.exports = {
  preparePayment
};
