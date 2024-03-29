require("dotenv").config();
const fs = require("fs");
const yargs = require("yargs");
const axios = require("axios");

// used on july-21

bodyObj = {
  "template": 19,
  "recipient_list": [
    {
      "contact":
      {
        "name": "",
        "email": ""
      }
    }
  ],
  "source_id": "5a0e2785-ca81-4c57-a541-52dab6a948d5",
  "priority": 2,
  "custom_replacement_fields": {
    "provider_url": ""
  },
  "desired_communication_channel": 1
}

const argv = yargs
  .command("file", "Tells the script what JSON users to email.", {
    template: {
      description: "The path for the user JSON to email.",
      alias: "f",
      type: "string"
    }
  }).option("subject", {
    alias: "s",
    description: "Subject helps us determine which users to email before any changes are necessary to the template.",
    type: "string"
  })
  .help()
  .alias("help", "h").argv;

console.log("args: ", argv);

async function runScript() {
  if (argv.s || argv.subject) {
    const message = argv.s || argv.subject;

    const file = fs.readFileSync(argv.f, "utf8");
    if (!file) {
      console.log("File contents are empty or invalid path.");
    }

    const results = await parseJson(message, file);
    console.log("real results: ", results)
    let label = "available";
    fs.writeFileSync(`./results/${argv.f}_${label}_results.json`, JSON.stringify(results));
  } else {
    console.log("You must put a subject for the emails.");
  }
}


async function parseJson(message, file) {
  const failed = [];
  const success = [];
  const not_target = [];

  const pFile = JSON.parse(file);
  for (let i = 0; i < pFile.length; i++) {
    let providerResult = await sendEmail(pFile[i], message);
    console.log("send example: ", providerResult)
    if (providerResult.status === "success") {
      console.log("Succeeded for: ", pFile[i][2])
      success.push(providerResult);
    } else if (providerResult.status === "failed") {
      console.log("Failed for: ", pFile[i][2])
      failed.push(providerResult);
    } else {
      console.log("IS NOT A TARGET: ", pFile[i][2])
      not_target.push(providerResult);
    }
  }

  return { success, failed, not_target };
}

async function sendEmail(provider, message) {
  let providerObj = {
    ...bodyObj,
    "custom_replacement_fields": {
      "provider_url": provider[1],
    },
    "recipient_list": [
      {
        "contact": {
          "name": provider[2],
          "email": provider[3]
        }
      }
    ]
  }

  const returnObject = {
    "name": provider[2],
    "email": provider[3],
    "provider_id": provider[0]
  };

  if (provider[4] === message) {
    let res = await axios.post(`${process.env.API_URL}`, providerObj);
    if (res.status === 200) {
      console.log("Has been sent to: ", provider[2]);
      returnObject.status = "success";
      return returnObject
    } else {
      console.log("Failed to send to: ", provider[2]);
      returnObject.status = "failed";
      return returnObject;
    }
  } else {
    console.log(provider[2], " is not a target");
    returnObject.status = "not_target";
    return returnObject;
  }
}

runScript();
