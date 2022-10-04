require("dotenv").config();
const fs = require("fs");
const yargs = require("yargs");
const axios = require("axios");

bodyObj = {
  "template": 43,
  "recipient_list": [
    {
      "contact":
      {
        "name": "",
        "phone_number": undefined
      }
    }
  ],
  "source_id": "5a0e2785-ca81-4c57-a541-52dab6a948d5",
  "priority": 2,
  "custom_replacement_fields": {},
  "desired_communication_channel": 2
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
        console.log("Succeeded for: ", `${pFile[i][0]}`)
        success.push(providerResult);
      } else if (providerResult.status === "failed") {
        console.log("Failed for: ", `${pFile[i][0]}`)
        failed.push(providerResult);
      } else {
        console.log("IS NOT A TARGET: ", `${pFile[i][0]}`)
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
    "custom_replacement_fields" : {
      "provider_name": provider[0]
    },
    "recipient_list": [
      {
        "contact": {
          "phone_number": `+1${provider[1]}`,
        }
      }
    ]
  }

  console.log("provider: ", providerObj);
  console.log(providerObj.recipient_list);

  const returnObject = {
    "name": `${provider[0]}`,
    "phone_number": provider[1]
  };
  console.log(process.env.API_URL, providerObj);

  let res = await axios.post(`${process.env.API_URL}`, providerObj);
  if (res.status === 200) {
    console.log("Has been sent to: ", provider[0]);
    returnObject.status = "success";
    return returnObject
  } else {
    console.log("Failed to send to: ", provider[0]);
    returnObject.status = "failed";
    return returnObject;
  }
}

runScript();
