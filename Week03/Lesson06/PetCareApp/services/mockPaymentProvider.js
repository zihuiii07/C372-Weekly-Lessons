// *changes: new file (L6) - mock payment provider, stands in for a real provider so no money moves
// supplied code from the Lesson 6 slides
exports.createPayment = async (request) => {
  return {
    providerPaymentId: 'mock_' + Date.now(),
    merchantReference: request.merchantReference,
    status: request.testStatus || 'PENDING'
  };
};
