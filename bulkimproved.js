// require("dotenv").config();
import { config } from "dotenv";
// const yargs = require("yargs");
import axios from "axios";
import inquirer from "inquirer";
import fs from "fs";

config();

const bodyObj = {
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

async function newScript () {

  const fileNames = fs.readdirSync("./data");

  const firstAnswers = await inquirer
    .prompt([
      {
        type: "list",
        name: "type",
        message: "Is this mobile or email?",
        choices: ["Mobile", "Email"]
      },
      {
        type: "number",
        name: "templateNumber",
        message: "What template number are you using?"
      },
      {
        type: "confirm",
        name: "test",
        message: "Is this a test?",
      },
      {
        when(answers) {
          return answers.test
        },
        name: "data",
        message: "Please add your data here:",
        type: "editor",
        waitUserInput: true
      },
      {
        when(answers) {
          return answers.test !== true
        },
        name: "file",
        message: "pick your file here:",
        type: "list",
        choices: fileNames
      }
    ]);
    
    firstAnswers.type === "Mobile" ? bodyObj.desired_communication_channel = 2 : bodyObj.desired_communication_channel = 1; 
    bodyObj.template = firstAnswers.templateNumber;

    // fixing the editor issues
    if (firstAnswers.test) {
      firstAnswers.data = firstAnswers.data.replace(/\n/g, "");
      console.log("You forgot to send brather")
      const testData = JSON.parse(firstAnswers.data);
      
      for (let i = 0; i < testData.length; i++) {
        const result = await sendMessage(testData[i]);
        console.log(result);
      }
    }
    
    console.log("input finished: ", firstAnswers);

    // How can I change the properties to work w/ any payload? 
    if (firstAnswers.file) {
      const selectedFile = fs.readFileSync(`./data/${firstAnswers.file}`, "utf8");

      const parseData = JSON.parse(selectedFile);
      console.log("parsed: ", parseData[0]);
      
      const keys = Object.keys(parseData[0]);

      const secondAnswers = await inquirer.prompt([
        {
          type: "confirm",
          name: "changes",
          message: `Do you want to change the current keys? \n ${keys.join(", ")}`
        },
        {
          when(answers) {
            return answers.changes;
          },
          name: "newKeys",
          message: "Input an array of the new keys: ",
          type: "editor",
          waitUserInput: true,
          default: JSON.stringify(keys)
        }
      ]);

      if (secondAnswers.changes) {
        const newKeys = JSON.parse(secondAnswers.newKeys);
        for (let i = 0; i < parseData.length; i++) {
          for (let o = 0; o < keys.length; o++) {
            parseData[i][newKeys[o]] = parseData[i][keys[o]];
            delete parseData[i][keys[o]];
          }
        }
      }

      // turn this into a utility function
      for (let i = 0; i < parseData.length; i++) {
        const messageResult = await sendMessage(parseData[i]);
        console.log("messageResult: ", messageResult)
      }
    }

}

async function sendMessage(provider) {
  let providerObj = {
    ...bodyObj,
    "custom_replacement_fields": {
      ...provider
    },
    "recipient_list": [
      {
        "contact": {}
      }
    ]
  }

  if (bodyObj.desired_communication_channel === 1) {
    providerObj.recipient_list[0].contact = {
      "email": provider["email"] || provider["email_address"],
      "name": provider["name"] || provider["provider_name"]
    }
  } else {
    providerObj.recipient_list[0].contact = {
      phone_number: provider["phone_number"] || provider["phone"],
    };
  }

  console.log("provider: ", providerObj);
  console.log(providerObj.recipient_list);

  const returnObject = {
    ...providerObj.recipient_list[0].contact
  };
    
  console.log(process.env.API_URL, providerObj);

  let res = await axios.post(`${process.env.API_URL}`, providerObj);
  if (res.status === 200) {
    // console.log("Has been sent to: ", provider[1]);
    returnObject.status = "success";
    return returnObject
  } else {
    // console.log("Failed to send to: ", provider[1]);
    returnObject.status = "failed";
    return returnObject;
  }
}

newScript();
