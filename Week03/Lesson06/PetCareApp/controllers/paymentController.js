// *changes: payment controller - L5 GET /payments/prepare/:serviceId (unchanged)
// *changes: L6 - added MockProvider import and createMockPayment (POST /payments/mock/:serviceId) from the supplied createMockPayment.txt
const services = require('../data/mockServices');
const MockProvider = require('../services/mockPaymentProvider'); // *changes: L6

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

// *changes: L6 - mock payment, supplied code (createMockPayment.txt)
async function createMockPayment(req, res) {
    const serviceId = Number(req.params.serviceId);
    const service = services.find(item => item.id === serviceId);
  
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
   }
 
   const paymentRequest = {
     amount: service.price,
     currency: 'sgd',
     merchantReference: 'SERVICE-' + service.id,
     description: service.name,
     testStatus: req.body?.testStatus
   };
 
   // call mock provider
  const providerResult = await MockProvider.createPayment(paymentRequest);
  
  const bookingStatusByPayment = {
    APPROVED: 'CONFIRMED',
    PENDING: 'AWAITING_PAYMENT',
    DECLINED: 'PAYMENT_FAILED'
  };
  
  return res.json({
   serviceId: service.id,
   providerPaymentId: providerResult.providerPaymentId,
   merchantReference: providerResult.merchantReference,
   paymentStatus: providerResult.status,
   bookingStatus: bookingStatusByPayment[providerResult.status]
 });
}

module.exports = {
  preparePayment,
  createMockPayment // *changes: L6
};
