set -ev
docker exec cli peer chaincode instantiate -n tradenet -v 1 -l node -c '{"Args":["org.example.trade:instantiate"]}' -C mychannel   