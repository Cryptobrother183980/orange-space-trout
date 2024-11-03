import { AppProps } from 'next/app'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import Navbar from '../components/Navbar'
import '../styles/globals.css'

const activeChains = [
  {
    chainId: 1116,
    name: "Core Network",
    rpc: ["https://rpc.core.com"],
    nativeCurrency: {
      name: "Core",
      symbol: "CORE",
      decimals: 18,
    },
    shortName: "core",
    explorers: [
      { name: "CoreScan", url: "https://scan.coredao.org", standard: "EIP3091" }
    ],
  },
  {
    chainId: 50,
    name: "XDC Network",
    rpc: ["https://rpc.xdc.org"],
    nativeCurrency: {
      name: "XDC",
      symbol: "XDC",
      decimals: 18,
    },
    shortName: "xdc",
    explorers: [
      { name: "XDCScan", url: "https://xdcscan.io", standard: "EIP3091" }
    ],
  },
  {
    chainId: 40,
    name: "Telos",
    rpc: ["https://mainnet.telos.net/evm"],
    nativeCurrency: {
      name: "Telos",
      symbol: "TLOS",
      decimals: 18,
    },
    shortName: "tlos",
    explorers: [
      { name: "Teloscan", url: "https://teloscan.io", standard: "EIP3091" }
    ],
  },
  {
    chainId: 8453,
    name: "Base",
    rpc: ["https://mainnet.base.org"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    shortName: "base",
    explorers: [
      { name: "Basescan", url: "https://basescan.org", standard: "EIP3091" }
    ],
  },
  {
    chainId: 245022934,
    name: "Neon EVM Mainnet",
    rpc: ["https://neon-proxy-mainnet.solana.p2p.org"],
    nativeCurrency: {
      name: "NEON",
      symbol: "NEON",
      decimals: 18,
    },
    shortName: "neon",
    explorers: [
      { name: "NeonScan", url: "https://neon.blockscout.com", standard: "EIP3091" }
    ],
  },
]

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      supportedChains={activeChains as any}
    >
      <Navbar />
      <Component {...pageProps} />
    </ThirdwebProvider>
  )
}

export default MyApp