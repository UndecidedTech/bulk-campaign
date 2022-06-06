# bulk-campaign

bulkcampaign

# Setup
```bash
npm install
```
```
1. make a .env file and add the comms server as API_URL="___API___URL___"
2. take provider excel spreadsheet and copy the rows to https://shancarter.github.io/mr-data-converter/ and convert to 2D array
3. copy 2D array formatted data to a json file
4. check that name, email, and message are the correct indecies in the script
```

# Usage
```bash
  node bulkhelper -f ${file} -s ${subjectLine}
```

