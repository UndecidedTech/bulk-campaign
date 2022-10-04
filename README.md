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

Take provider excel spreadsheet and copy the rows to the [dataconverter](https://shancarter.github.io/mr-data-converter/) and convert to an array of objects and copy the formatted data to a new json file in the data/ directory.

check that the email or phone number, name, and other relevant content are the correctly labeled in the data.
```
provider[0] should be provider_id
provider[3] should be message/subjectLine
provider[4] should be name
provider[5] should be email
```

# Usage

```bash
  node bulkimproved.js
```

[![asciicast](https://asciinema.org/a/PKIeqwe62AX98SOC4DzlXn9hk.svg)](https://asciinema.org/a/PKIeqwe62AX98SOC4DzlXn9hk)

