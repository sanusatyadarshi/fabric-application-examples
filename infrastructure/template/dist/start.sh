#!/bin/bash

#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.

set -e

# Using docker-compose-e2e-template.yaml, replace constants with private key file names
# generated by the cryptogen tool and output a docker-compose.yaml specific to this
# configuration
function replacePrivateKey() {
  # sed on MacOSX does not support -i flag with a null extension. We will use
  # 't' for our back-up's extension and delete it at the end of the function

  # Copy the template to the file that will be modified to add the private key
  cp docker-compose-tls-template.yaml docker-compose-tls.yaml

  # The next steps will replace the template's contents with the
  # actual values of the private key file names for the two CAs.
  CURRENT_DIR=$PWD
  cd crypto-config/peerOrganizations/magnetocorp.example.com/ca/
  PRIV_KEY=$(ls *_sk)
  echo ${PRIV_KEY}
  cd "$CURRENT_DIR"
  sed -i "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-tls.yaml
  cd crypto-config/peerOrganizations/digibank.example.com/ca/
  PRIV_KEY=$(ls *_sk)
  cd "$CURRENT_DIR"
  sed -i "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-tls.yaml
 
}

replacePrivateKey

# create Docker Network
docker network create commercialpaper-net

docker-compose -f docker-compose-tls.yaml up -d 

# wait for Hyperledger Fabric to start
# incase of errors when running later commands, issue export FABRIC_START_TIMEOUT=<larger number>
# Check MagnetoCorp Peer
export FABRIC_START_TIMEOUT=30
for i in $(seq 1 ${FABRIC_START_TIMEOUT})
do
    # This command only works if the peer is up and running
    if docker exec peer1.magnetocorp.example.com peer channel list > /dev/null 2>&1
    then
        # Peer now available
        break
    else
        # Sleep and try again
        sleep 1
    fi
done
echo Hyperledger Fabric MagnertoCorp Peer checked in $i seconds

# Check Digibank Peer
export FABRIC_START_TIMEOUT=30
for i in $(seq 1 ${FABRIC_START_TIMEOUT})
do
    # This command only works if the peer is up and running
    if docker exec peer5.digibank.example.com peer channel list > /dev/null 2>&1
    then
        # Peer now available
        break
    else
        # Sleep and try again
        sleep 1
    fi
done

echo Hyperledger Fabric DigiBank peer checked in $i seconds


ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/magnetocorp.example.com/orderers/orderer1.magnetocorp.example.com/msp/tlscacerts/tlsca.magnetocorp.example.com-cert.pem

# Check to see if the channel already exists
if ! docker exec peer1.magnetocorp.example.com peer channel getinfo -c papernet
then
    echo Create the channel
    docker exec -e "CORE_PEER_ADDRESS=peer1.magnetocorp.example.com:7051" -e "CORE_PEER_LOCALMSPID=magnetocorpMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magnetocorp.example.com/users/Admin@magnetocorp.example.com/msp" cli peer channel create -o orderer1.magnetocorp.example.com:7050 -c papernet -f ./channel-artifacts/channel.tx --tls true --cafile $ORDERER_CA

    echo -----------------------------------------------------
    echo Join MagnetoCorp Peer to the channel.
    docker exec -e "CORE_PEER_ADDRESS=peer1.magnetocorp.example.com:7051" -e "CORE_PEER_LOCALMSPID=magnetocorpMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magnetocorp.example.com/users/Admin@magnetocorp.example.com/msp"  -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magnetocorp.example.com/peers/peer1.magnetocorp.example.com/tls/ca.crt" cli peer channel join -b papernet.block 

    echo -----------------------------------------------------
    echo Join DigiBank Peer to the channel.
    docker exec -e "CORE_PEER_ADDRESS=peer5.digibank.example.com:8051" -e "CORE_PEER_LOCALMSPID=digibankMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/digibank.example.com/users/Admin@digibank.example.com/msp" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/digibank.example.com/peers/peer5.digibank.example.com/tls/ca.crt" cli peer channel join -b papernet.block 

    echo -----------------------------------------------------
    echo Update channel with MagnetoCorp information.
    docker exec -e "CORE_PEER_ADDRESS=peer1.magnetocorp.example.com:7051" -e "CORE_PEER_LOCALMSPID=magnetocorpMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/magnetocorp.example.com/users/Admin@magnetocorp.example.com/msp" cli peer channel update -o orderer1.magnetocorp.example.com:7050 -c papernet -f ./channel-artifacts/magnetocorpMSPanchors.tx --tls true --cafile $ORDERER_CA

    echo -----------------------------------------------------
    echo Update channel with Digibank information
    docker exec -e "CORE_PEER_ADDRESS=peer5.digibank.example.com:8051" -e "CORE_PEER_LOCALMSPID=digibankMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/digibank.example.com/users/Admin@digibank.example.com/msp" cli peer channel update -o orderer1.magnetocorp.example.com:7050 -c papernet -f ./channel-artifacts/digibankMSPanchors.tx --tls true --cafile $ORDERER_CA
fi
