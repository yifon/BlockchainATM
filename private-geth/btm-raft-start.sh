#!/bin/bash
set -u
set -e
rm -rf nohup.out
# GLOBAL_ARGS="--raft --rpc --rpcaddr localhost --rpcapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum --emitcheckpoints"

GLOBAL_ARGS="--rpc --rpcaddr localhost --rpcapi admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum"

sleep 1

echo "[*] Starting node 1"
nohup geth --datadir qdata/dd1 $GLOBAL_ARGS --rpcport 8101 --port 8301 --networkid 999 2>>qdata/logs/1.log &
echo "[*] Starting node 2"
nohup geth --datadir qdata/dd2 $GLOBAL_ARGS --rpcport 8102 --port 8302 --networkid 999 2>>qdata/logs/2.log &
echo "[*] Starting node 3"
nohup geth --datadir qdata/dd3 $GLOBAL_ARGS --rpcport 8103 --port 8303 --networkid 999 2>>qdata/logs/3.log &







echo "[*] Waiting for nodes to start"
sleep 10
echo "All nodes configured. See 'qdata/logs' for logs, and run e.g. 'geth attach qdata/dd1/geth.ipc' to attach to the first Geth node"
