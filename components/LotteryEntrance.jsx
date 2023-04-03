import React from "react";
import { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constans/index";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";
import { Bell, AlertTriangle, EthColored } from "@web3uikit/icons";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  const dispatch = useNotification(); // like a popup

  /* Store functions from contract using web3contract */
  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getnNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    const entranceFeeFromContract = (await getEntranceFee()).toString();
    setEntranceFee(entranceFeeFromContract);

    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    setNumPlayers(numPlayersFromCall);

    const recentWinnerFromCall = await getRecentWinner();
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI(); // we paste it here to render all stuf without f5 page
  };

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: <Bell fontSize="25px" />,
    });
  };

  const handleErrorNotification = function () {
    dispatch({
      type: "error",
      message: "Something went wrong",
      title: "Error",
      position: "topR",
      icon: <AlertTriangle fontSize="25px" />,
    });
  };

  return (
    <div className=" flex flex-col px-10 py-5 ">
      Lottery Entrance:
      {raffleAddress ? (
        <div>
          <button
            className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto "
            onClick={async function () {
              await enterRaffle({
                // onComplete:
                // onError:
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className=" animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div className=" flex ">
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}
            <EthColored fontSize="24px" />
          </div>
          <div>Number of players: {numPlayers}</div>
          <div>Recent Winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Raffle Address Found!</div>
      )}
    </div>
  );
}
