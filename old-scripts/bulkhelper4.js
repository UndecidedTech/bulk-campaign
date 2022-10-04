require("dotenv").config();
const fs = require("fs");
const yargs = require("yargs");
const axios = require("axios");

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
  })
  .help()
  .alias("help", "h").argv;

async function runScript() {
  const file = fs.readFileSync(argv.f, "utf8");
  if (!file) {
    console.log("File contents are empty or invalid path.");
  }

  const results = await parseJson(file);
  console.log("real results: ", results)
  fs.writeFileSync(`./results/${argv.f}_textmsg_results.json`, JSON.stringify(results));
}


async function parseJson(file) {
  const failed = [];
  const success = [];
  const not_target = [];

  const pFile = JSON.parse(file);
  for (let i = 0; i < pFile.length; i++) {
    try  {
      console.log(pFile[i]);
      let providerResult = await sendText(pFile[i]);
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
    }  catch (err)  {
      // console.error(err);
    } 
  }

  return { success, failed, not_target };
}

async function sendText(provider) {
  let providerObj = {
    ...bodyObj,
    "custom_replacement_fields": {
      "provider_url": provider[1]
    },
    "recipient_list": [
      {
        "contact": {
          "email": provider[3],
          "name": provider[2]
        }
      }
    ]
  }

  console.log("provider: ", providerObj);
  console.log(providerObj.recipient_list);

  const returnObject = {
    "name": provider[2],
    "email": provider[3]
  };
  console.log(process.env.API_URL, providerObj);

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
}

runScript();
