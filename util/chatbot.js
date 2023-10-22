require("dotenv/config");
const https = require("https");
const request = require("request");

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  const agentOptions = {
    rejectUnauthorized: false,
  };

  const agent = new https.Agent(agentOptions);
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
      agent: agent,
    },
    (err, res, body) => {
      console.log(body);
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an attachment!`,
    };
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

//get profile use
const getProfileUser = async (sender_psid) => {
  // Send the HTTP request to the Messenger Platform
  return new Promise(async (resolve, reject) => {
    request(
      {
        uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        method: "GET",
        agent: agent,
      },
      async (err, res, body) => {
        console.log(err);
        if (!err) {
          const profileUser = await JSON.parse(body);
          resolve(profileUser);
        } else {
          console.error("Not get profile user:" + err);
          reject(err);
        }
      }
    );
  });
};

//handle click get started
const handleGetStarted = async (sender_psid) => {
  try {
    const profileUser = await getProfileUser(sender_psid);
    const response = {
      text: `Welcome ${profileUser.first_name} ${profileUser.last_name} to my page. Have a good day!`,
    };
    return response;
  } catch (err) {
    console.log(err);
    return { text: "Error. Please contact with admin." };
  }
};

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case "yes":
      // code block
      response = { text: "Thanks!" };
      break;
    case "no":
      // code block
      response = { text: "Oops, try sending another image." };
      break;
    case "GET_STARTED":
      //handle
      response = await handleGetStarted(sender_psid);
      break;
    default:
      // code block
      response = {
        text: `Opps, I don't know what is the response with ${payload}`,
      };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

module.exports = {
  handleMessage,
  handlePostback,
};
