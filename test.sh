# read in .env file
export $(egrep -v '^#' .env | xargs)

curl https://api.robinhood.com/portfolios/${ACCOUNT}/ \
   -H "Accept: application/json" \
   -H "Authorization: Bearer ${AUTH_TOKEN}" | jq
