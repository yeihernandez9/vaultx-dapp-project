import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import type { Signer } from "ethers";

export function useWeb3React() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.ethereum) return;

    const _provider = new BrowserProvider(window.ethereum);
    setProvider(_provider);

    // Auto-reconnect: check if MetaMask already has authorized accounts
    // eth_accounts does NOT prompt the user, it just returns already-connected accounts
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const _signer = await _provider.getSigner();
          setSigner(_signer);
          setActive(true);
          const net = await _provider.getNetwork();
          setChainId(Number(net.chainId));
        }
      })
      .catch(console.error);

    // Listen for account/network changes
    window.ethereum.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const _signer = await _provider.getSigner();
        setSigner(_signer);
        setActive(true);
      } else {
        deactivate();
      }
    });

    window.ethereum.on("chainChanged", (hexChainId: string) => {
      setChainId(parseInt(hexChainId, 16));
      // Reload recommended by MetaMask when chain changes
      window.location.reload();
    });
  }, []);

  // Prompt user to connect (eth_requestAccounts triggers MetaMask popup)
  const activate = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const _provider = new BrowserProvider(window.ethereum);
      setProvider(_provider);
      setAccount(accounts[0]);
      const _signer = await _provider.getSigner();
      setSigner(_signer);
      setActive(true);
      const net = await _provider.getNetwork();
      setChainId(Number(net.chainId));
    } catch (error) {
      console.error("User denied account access", error);
    }
  };

  // Helper to force MetaMask to add/switch to Ganache network
  const switchToGanache = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // 1337 in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x539',
                chainName: 'Ganache Local',
                rpcUrls: ['http://127.0.0.1:7545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Ganache network", addError);
        }
      }
      console.error("Failed to switch to Ganache network", switchError);
    }
  };

  // Clears local session — MetaMask has no programmatic disconnect API
  const deactivate = () => {
    setAccount(null);
    setSigner(null);
    setActive(false);
    setChainId(null);
  };

  return { account, provider, signer, chainId, active, activate, deactivate, switchToGanache };
}
