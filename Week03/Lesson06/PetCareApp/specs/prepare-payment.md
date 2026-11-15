# Feature: Prepare payment details

## 1. User goal
Pet owners want to see the service and price before paying
## 2. Scope
The feature should return payment details as JSON from the mock data. It should not charge money, use a gateway, add tables or add pages, and it does not require login (classroom mock only)
## 3. Request
GET /payments/prepare/:serviceId. The price comes from the server, never from the client
Input: serviceId in the URL (a number). No request body.
Any amount sent by the client (e.g. ?amount=1) is ignored.
## 4. Service catalogue
1 Vaccination 35, 2 Pet Grooming 50, 3 Boarding 80
## 5. Successful response
200 with exactly 5 fields: serviceId (number), serviceName (string), amount (number), currency (string, always "sgd"), status (string, always "READY_FOR_PAYMENT")

Example:
```json
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}
```

## 6. Unsuccessful response
Unknown ID gives 404 {"error":"Service not found"}
## 7. Acceptance criteria
- AC1: Service ID 1 → 200, serviceName Vaccination, amount 35
- AC2: Service ID 2 → 200, serviceName Pet Grooming, amount 50
- AC3: Service ID 3 → 200, serviceName Boarding, amount 80
- AC4: Service ID 999 → 404, {"error":"Service not found"}
- AC5: Any successful response has exactly 5 fields: serviceId and amount are numbers, serviceName, currency and status are strings, currency is "sgd" and status is "READY_FOR_PAYMENT"

## 8. Open questions
- What should happen if serviceId is not a number, e.g. /payments/prepare/abc?
