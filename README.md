# bulk-campaign

This should make our lives easier trying to send out the bulk emails

# Setup
```bash
npm install
```
Make .env file
```
API_URL="___API___URL___"
```

Take provider excel spreadsheet and copy the rows to the [dataconverter](https://shancarter.github.io/mr-data-converter/) and convert to 2D array (Array rows) and copy the 2D array formatted data to a new json file

check that the name, email, and message are the correct indecies in the script

NOTE: I want to add support for this in the future to recognize the headers so you don't need to check these fields manually.
```
provider[0] should be provider_id
provider[3] should be message/subjectLine
provider[4] should be name
provider[5] should be email
```

# Usage

```bash
  node bulkhelper -f ${file} -s ${subjectLine}
```

