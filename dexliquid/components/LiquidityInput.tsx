import React from "react"
import styles from "../styles/Home.module.css"

type Props = {
  type: "native" | "token"
  tokenSymbol: string
  tokenBalance?: string
  setValue: (value: string) => void
  max?: string
  value: string
}

export default function LiquidityInput({
  type,
  tokenSymbol,
  tokenBalance,
  setValue,
  value,
  max,
}: Props) {
  const truncate = (value: string) => {
    if (value === undefined) return
    if (value.length > 5) {
      return value.slice(0, 5)
    }
    return value
  }

  return (
    <div className={styles.swapInputContainer}>
      <input
        type="number"
        placeholder="0.0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={styles.swapInput}
      />
      <div className={styles.swapInputInfo}>
        <p className={styles.tokenSymbol}>{tokenSymbol}</p>
        <p className={styles.tokenBalance}>Balance: {truncate(tokenBalance as string)}</p>
        <button onClick={() => setValue(max || "0")} className={styles.maxButton}>
          Max
        </button>
      </div>
    </div>
  )
}