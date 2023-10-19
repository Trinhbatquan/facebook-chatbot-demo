const express = require("express");
require("dotenv/config");
const cors = require("cors");

const request = require("request");

const app = express();
app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Cho phép truy cập từ mọi nguồn
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  return res.json("hello chatbot");
});

app.post("/webhook", async (req, res) => {
  let body = req.body;

  console.log(`\u{1F7EA} Received webhook:`);
  console.dir(body, { depth: null });
  // Send a 200 OK response if this is a page webhook

  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Add support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// function handleMessage(senderPsid, receivedMessage) {
//   let response;

//   // Checks if the message contains text
//   if (receivedMessage.text) {
//     // Create the payload for a basic text message, which
//     // will be added to the body of your request to the Send API
//     response = {
//       text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
//     };
//   } else if (receivedMessage.attachments) {
//     // Get the URL of the message attachment
//     let attachmentUrl = receivedMessage.attachments[0].payload.url;
//     response = {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [
//             {
//               title: "Is this the right picture?",
//               subtitle: "Tap a button to answer.",
//               image_url: attachmentUrl,
//               buttons: [
//                 {
//                   type: "postback",
//                   title: "Yes!",
//                   payload: "yes",
//                 },
//                 {
//                   type: "postback",
//                   title: "No!",
//                   payload: "no",
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     };
//   }

//   // Send the response message
//   callSendAPI(senderPsid, response);
// }

// function callSendAPI(senderPsid, response) {
//   // The page access token we have generated in your app settings
//   const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

//   // Construct the message body
//   let requestBody = {
//     recipient: {
//       id: senderPsid,
//     },
//     message: response,
//   };

//   // Send the HTTP request to the Messenger Platform
//   request(
//     {
//       uri: "https://graph.facebook.com/v2.6/me/messages",
//       qs: { access_token: PAGE_ACCESS_TOKEN },
//       method: "POST",
//       json: requestBody,
//     },
//     (err, _res, _body) => {
//       if (!err) {
//         console.log("Message sent!");
//       } else {
//         console.error("Unable to send message:" + err);
//       }
//     }
//   );
// }

app.listen(5000, () => {
  console.log("server chatbot running....");
});

module.exports = app;
