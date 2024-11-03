"use client";

import { useState, useEffect } from "react";
import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useSDK,
  useTokenBalance,
  useBalance,
  toWei,
} from "@thirdweb-dev/react";
import NetworkSelector from "../components/NetworkSelector";
import LiquidityInput from "../components/LiquidityInput";
import styles from "../styles/Home.module.css";

enum NetworkId {
  Core = "core",
  Xdc = "xdc",
  Tlos = "tlos",
  Base = "base",
  Neon = "neon",
}

type Network = {
  id: NetworkId;
  name: string;
  nativeToken: string;
};

const networks: Network[] = [
  { id: NetworkId.Core, name: "CORE", nativeToken: "CORE" },
  { id: NetworkId.Xdc, name: "XDC", nativeToken: "XDC" },
  { id: NetworkId.Tlos, name: "TLOS", nativeToken: "TLOS" },
  { id: NetworkId.Base, name: "BASE", nativeToken: "ETH" },
  { id: NetworkId.Neon, name: "NEON", nativeToken: "NEON" },
];

const contractAddresses: Record<NetworkId, { TOKEN_CONTRACT: string; DEX_CONTRACT: string }> = {
  [NetworkId.Core]: {
    TOKEN_CONTRACT: "0x743b30c4645612a3a22AaE2b19A051b478B60cCa",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  [NetworkId.Xdc]: {
    TOKEN_CONTRACT: "0x32bb1c8Be72bB0e826d02d4905eC09F3DAdD5587",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  [NetworkId.Tlos]: {
    TOKEN_CONTRACT: "0x349f961500C274e179a298618198Ea8f88513bfc",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  [NetworkId.Base]: {
    TOKEN_CONTRACT: "0x54265cCd283Ad1e3F462eCf93BcbA5Ecc42c56Bd",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
  [NetworkId.Neon]: {
    TOKEN_CONTRACT: "0x5f09f0443ca2d1395C639657Bca40cB3b6444A20",
    DEX_CONTRACT: "0x5f16053137B88cAB27315653936c3Ff439d7d8B5",
  },
};

type LiquidityLog = {
  wallet: string;
  action: "add" | "remove";
  amount: number;
  timestamp: string;
};

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);
  const TOKEN_CONTRACT = contractAddresses[selectedNetwork.id]?.TOKEN_CONTRACT;
  const DEX_CONTRACT = contractAddresses[selectedNetwork.id]?.DEX_CONTRACT;

  const sdk = useSDK();
  const address = useAddress();
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT);
  const { contract: dexContract } = useContract(DEX_CONTRACT);
  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { data: nativeBalance } = useBalance();
  const { data: dexTokenBalance } = useTokenBalance(tokenContract, DEX_CONTRACT);
  const { data: dexNativeBalance } = useBalance(DEX_CONTRACT);

  const [nativeAmount, setNativeAmount] = useState<string>("0");
  const [tokenAmount, setTokenAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [logs, setLogs] = useState<Record<NetworkId, LiquidityLog[]>>(() => {
    if (typeof window !== "undefined") {
      const cachedLogs = JSON.parse(localStorage.getItem("liquidityLogs") || "{}");
      return cachedLogs;
    }
    return {};
  });
  const [totalLiquidity, setTotalLiquidity] = useState<Record<NetworkId, number>>(() => {
    if (typeof window !== "undefined") {
      const cachedTotal = JSON.parse(localStorage.getItem("totalLiquidity") || "{}");
      return cachedTotal;
    }
    return {};
  });

  const { mutateAsync: addLiquidity } = useContractWrite(dexContract, "addLiquidity");
  const { mutateAsync: removeLiquidity } = useContractWrite(dexContract, "removeLiquidity");
  const { mutateAsync: approveTokenSpending } = useContractWrite(tokenContract, "approve");

  useEffect(() => {
    // Cache logs and total liquidity in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("liquidityLogs", JSON.stringify(logs));
      localStorage.setItem("totalLiquidity", JSON.stringify(totalLiquidity));
    }
  }, [logs, totalLiquidity]);

  const handleAddLiquidity = async () => {
    setIsLoading(true);
    try {
      await approveTokenSpending({
        args: [DEX_CONTRACT, toWei(tokenAmount)],
      });
      await addLiquidity({
        args: [toWei(tokenAmount)],
        overrides: {
          value: toWei(nativeAmount),
        },
      });

      const liquidityAdded = parseFloat(nativeAmount);
      const newLog: LiquidityLog = {
        wallet: address as string,
        action: "add",
        amount: liquidityAdded,
        timestamp: new Date().toISOString(),
      };

      setLogs((prevLogs) => ({
        ...prevLogs,
        [selectedNetwork.id]: [...(prevLogs[selectedNetwork.id] || []), newLog],
      }));
      setTotalLiquidity((prevTotal) => ({
        ...prevTotal,
        [selectedNetwork.id]: (prevTotal[selectedNetwork.id] || 0) + liquidityAdded,
      }));

      alert("Liquidity added successfully");
      setNativeAmount("0");
      setTokenAmount("0");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      alert("An error occurred while adding liquidity. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    setIsLoading(true);
    try {
      await removeLiquidity({
        args: [toWei(tokenAmount)],
      });

      const liquidityRemoved = parseFloat(nativeAmount);
      const newLog: LiquidityLog = {
        wallet: address as string,
        action: "remove",
        amount: liquidityRemoved,
        timestamp: new Date().toISOString(),
      };

      setLogs((prevLogs) => ({
        ...prevLogs,
        [selectedNetwork.id]: [...(prevLogs[selectedNetwork.id] || []), newLog],
      }));
      setTotalLiquidity((prevTotal) => ({
        ...prevTotal,
        [selectedNetwork.id]: Math.max((prevTotal[selectedNetwork.id] || 0) - liquidityRemoved, 0),
      }));

      alert("Liquidity removed successfully");
      setNativeAmount("0");
      setTokenAmount("0");
    } catch (error) {
      console.error("Error removing liquidity:", error);
      alert("An error occurred while removing liquidity. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main} style={{ backgroundColor: "#00B4D8" }}>
      <div className={styles.container}>
        <div className={styles.swapContainer}>
          <NetworkSelector
            networks={networks}
            selectedNetwork={selectedNetwork}
            onSelectNetwork={(network) => setSelectedNetwork(network)}
          />
          {address ? (
            <>
              <LiquidityInput
                type="native"
                tokenSymbol={selectedNetwork.nativeToken}
                tokenBalance={nativeBalance?.displayValue}
                setValue={setNativeAmount}
                max={nativeBalance?.displayValue}
                value={nativeAmount}
              />
              <LiquidityInput
                type="token"
                tokenSymbol={symbol as string}
                tokenBalance={tokenBalance?.displayValue}
                setValue={setTokenAmount}
                max={tokenBalance?.displayValue}
                value={tokenAmount}
              />
              <div className={styles.swapButtonContainer}>
                <button
                  onClick={handleAddLiquidity}
                  disabled={isLoading}
                  className={styles.swapButton}
                  style={{ backgroundColor: "green" }}
                >
                  {isLoading ? "Adding Liquidity..." : "Add Liquidity"}
                </button>
                <button
                  onClick={handleRemoveLiquidity}
                  disabled={isLoading}
                  className={styles.swapButton}
                  style={{ backgroundColor: "red" }}
                >
                  {isLoading ? "Removing Liquidity..." : "Remove Liquidity"}
                </button>
              </div>
            </>
          ) : (
            <p>Please connect your wallet to continue.</p>
          )}
        </div>

        <div>
          <h3>Total Liquidity for {selectedNetwork.name}: {totalLiquidity[selectedNetwork.id] || 0}</h3>
          <h4>Liquidity Action Logs for {selectedNetwork.name}:</h4>
          <ul>
            {logs[selectedNetwork.id]?.map((log, index) => (
              <li key={index} style={{ color: "green" }}>
                {log.timestamp} - {log.action === "add" ? "Added" : "Removed"} {log.amount} {selectedNetwork.nativeToken} by {log.wallet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
