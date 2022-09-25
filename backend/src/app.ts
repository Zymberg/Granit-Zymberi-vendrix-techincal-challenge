import { GraphQLClient, gql } from 'graphql-request'
import { valueToString } from './../node_modules/@sinonjs/commons/types/index.d';
import express, { NextFunction, Response, Request } from 'express';
import { createClient } from 'redis';


// -------------------------------------------------------------
// -------------------------------------------------------------
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const app = express();

// Body Parser
app.use(express.json());
let redisClient: any;

(async () => {
  redisClient = createClient();

  redisClient.on('error', (error: unknown) =>
    console.error(`Error : ${error}`)
  );

  await redisClient.connect();
})();

app.use('/users', async (req: Request, res: Response, next: NextFunction) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  } else if (req.method === 'GET') {
    const cacheResults = await redisClient.get('users');
    if (cacheResults) {
      console.log('cached users', { data: JSON.parse(cacheResults) });
      return res.status(200).json({
        data: JSON.parse(cacheResults),
      });
    } else {
      console.log('no cached users');
      return res.status(200).json({
        data: [],
      });
    }
  } else {
    const cacheResults = await redisClient.get('users');
    if (cacheResults) {
      await redisClient.set(
        'users',
        JSON.stringify([...JSON.parse(cacheResults), req.body])
      );
      const updatedData = await redisClient.get('users');

      console.log('updated cached users', { data: req.body });
      return res.status(200).json({
        data: JSON.parse(updatedData),
      });
    } else {
      await redisClient.set('users', JSON.stringify([req.body]));
      const updatedData = await redisClient.get('users');

      console.log('initiated users', { data: JSON.parse(updatedData) });
      return res.status(200).json({
        data: JSON.parse(updatedData),
      });
    }
  }
  next();
});

/**
 * Second Phase Stub Out
 *
 * TODO: implement endpoint
 */
app.use(
  '/cards/:cardId',
  async (req: Request, res: Response, next: NextFunction) => {
    // return apiKey;
// console.log("APIIIII" + process.env.API_KEY?.toString)
//     return res.status(200).json({
//       data : process.env.API_KEY?.toString
//     })
    var apiKey = process.env.API_KEY || ""
    if(req.method === "GET"){
      const url = req.protocol + '://' + req.get('host') + req.originalUrl;
      const queryParam = url.substring(url.lastIndexOf('/') + 1)

      const endpoint = 'https://api.us.test.highnoteplatform.com/'+queryParam;
      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: 'Basic ' + Buffer.from(apiKey).toString('base64'),
        },
      })
    
      const mutation = gql`
      query GetPaymetCardById($paymentCardId: ID!) {
        node(id: $paymentCardId) {
          ... on PaymentCard {
            id
            bin
            last4
            expirationDate
            network
            status
            formFactor
            restrictedDetails {
              ... on PaymentCardRestrictedDetails {
                number
                cvv
              }
              ... on AccessDeniedError {
                message
              }
            }
            physicalPaymentCardOrders {
              id
              paymentCardShipment {
                courier {
                  method
                  signatureRequiredOnDelivery
                  tracking {
                    trackingNumber
                    actualShipDateLocal
                  }
                }
                requestedShipDate
                deliveryDetails {
                  name {
                    middleName
                    givenName
                    familyName
                    suffix
                    title
                  }
                  companyName
                  address {
                    streetAddress
                    extendedAddress
                    postalCode
                    region
                    locality
                    countryCodeAlpha3
                  }
                }
                senderDetails {
                  name {
                    givenName
                    middleName
                    familyName
                    suffix
                    title
                  }
                  companyName
                  address {
                    streetAddress
                    extendedAddress
                    postalCode
                    region
                    locality
                    countryCodeAlpha3
                  }
                }
              }
              orderState {
                status
              }
              cardPersonalization {
                textLines {
                  line1
                  line2
                }
              }
              createdAt
              updatedAt
              stateHistory {
                previousStatus
                newStatus
                createdAt
              }
            }
          }
        }
      }
      
      `
    
      // const variables = {
      //   title: 'Inception',
      //   releaseDate: 2010,
      // }
      // const returnData = await graphQLClient.request(mutation,"paymentCardId:"+ queryParam).then((data) +
        
      
      // )
      
      // console.log(JSON.stringify(data, undefined, 2))
      // return res.status(200).json({
      //   data : returnData
      // })
    }
    next(); 
  }
);

export default app;
