# read in .env file
export $(egrep -v '^#' .env | xargs)

curl -sv ${BASE_URL-https://api.robinhood.com}/portfolios/${ACCOUNT}/ \
   -H "Accept: application/json" \
   -H "Authorization: Bearer ${AUTH_TOKEN}" | jq

curl -sv ${BASE_URL-https://api.robinhood.com}/positions/ \
   -H "Accept: application/json" \
   -H "Authorization: Bearer ${AUTH_TOKEN}" | jq
