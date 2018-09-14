const express = require('express')
const request = require('request')
const crypto = require('crypto')
const Base64 = require('js-base64').Base64
const app = express()

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}

app.get('/', (req, res) => {
    request.post({ url: 'https://sandbox.bca.co.id/api/oauth/token', headers: { Authorization: 'Basic ' + Base64.encode("a7b3c7f4-4b94-40df-bdc9-5add561a10f9:9ee92b34-0499-446a-8d44-3415b81e7ca7") }, form: { grant_type: 'client_credentials' } }, function (err, httpResponse, body) {

        var accessToken = JSON.parse(body).access_token;

        var requestBody = {
            "MerchantID": "89000",
            "MerchantName": "Merchant One",
            "Amount": "100.22",
            "Tax": "0.0",
            "TransactionID": "156479",
            "CurrencyCode": "IDR",
            "RequestDate": "2015-04-29T09:54:00.234+07:00",
            "ReferenceID": "123465798"
        };

        var requestBodyReplace = JSON.stringify(requestBody).replaceAll('\n', '').replaceAll('\t', '').replaceAll('\r', '').replaceAll(' ', '')
        var sha256 = crypto.createHash('sha256').update(requestBodyReplace).digest("hex").toLowerCase()
        var timeStamp = new Date().toISOString()
        var stringHash = "POST:/sakuku-commerce/payments:" + accessToken + ":" + sha256 + ":" + timeStamp;
        var key = '024e972d-62d2-4bf8-aafc-5862ae661446'
        var signature = crypto.createHmac('sha256', key).update(stringHash).digest('hex')

        var options = {
            uri: 'https://sandbox.bca.co.id/sakuku-commerce/payments',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'X-BCA-Key': 'b742f0fb-6970-4356-9faf-71d35b1295f4',
                'X-BCA-Timestamp': timeStamp,
                'X-BCA-Signature': signature
            },
            json: requestBody
        }

        request(options, function (error, response, body) {
            res.send(body);
        })
    })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))