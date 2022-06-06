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
    "provider_id": ""
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

if (argv.s || argv.subject) {
  const message = argv.s || argv.subject;
  const file = fs.readFileSync(argv.f, "utf8");
  if (!file) {
    return console.log("File contents are empty or invalid path.");
  }

  let providerArray = [];

  const pFile = JSON.parse(file);
  pFile.forEach((provider) => {
    let providerObj = {
      ...bodyObj,
      "custom_replacement_fields": {
        "provider_id": provider[0]
      },
      "recipient_list": [
        {
          "contact": {
            "name": provider[4],
            "email": provider[5]
          }
        }
      ]
    }

    if (provider[3] === message) {
      axios.post(`${process.env.API_URL}`,
        providerObj
      )
        .then(res => {
          if (res.status === 200) {
            providerArray.push({ "name": provider[4], "email": provider[5], "provider_id": provider[0], "subjectLine": provider[3], "status": "completed" });
          } else {
            providerArray.push({ "name": provider[4], "email": provider[5], "provider_id": provider[0], "subjectLine": provider[3], "status": "failed" });
          }
        });
    } else {
      console.log(provider[4], " is not a target");
      providerArray.push({ "name": provider[4], "email": provider[5], "provider_id": provider[0], "subjectLine": provider[3], "status": "not a target" });
    }
  });

  fs.writeFileSync("results.json", JSON.stringify(providerArray));
  console.log("Check results.json to see the output of this script or whether any errors might have occured.");
} else {
  console.log("You must put a subject for the emails.");
}

