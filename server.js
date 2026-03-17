const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for user sessions
const userSessions = {};

// Route: Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: API - Diagnose transaction issues
app.post('/api/diagnose/transaction', (req, res) => {
  const { txHash, chainId, status } = req.body;
  
  if (!txHash) {
    return res.status(400).json({ error: 'Transaction hash required' });
  }

  const diagnosis = {
    txHash,
    chainId: chainId || 8453, // Base Chain ID
    possibleCauses: [
      'Insufficient gas',
      'Nonce mismatch',
      'RPC error',
      'Contract revert',
      'Pending mempool'
    ],
    solutions: [
      'Check Basescan (basescan.org) for transaction status',
      'Verify wallet balance for gas fees',
      'Try increasing gas limit (21000 minimum)',
      'Reset wallet nonce if stuck',
      'Wait for network congestion to clear'
    ],
    recommendation: 'Use Basescan to verify current status before retrying'
  };

  res.json(diagnosis);
});

// Route: API - Wallet connection troubleshooting
app.post('/api/diagnose/wallet', (req, res) => {
  const { walletType, error } = req.body;
  
  const walletGuides = {
    metamask: {
      name: 'MetaMask',
      steps: [
        'Ensure MetaMask extension is installed and enabled',
        'Check if you\'re on the correct network (Base Chain ID: 8453)',
        'Clear browser cache and restart MetaMask',
        'Try connecting in incognito mode',
        'Reinstall MetaMask if issues persist'
      ],
      rpcUrl: 'https://mainnet.base.org',
      chainId: 8453
    },
    walletconnect: {
      name: 'WalletConnect',
      steps: [
        'Ensure your mobile wallet supports Base network',
        'Verify QR code scanner is working',
        'Check internet connection on both devices',
        'Update WalletConnect to latest version',
        'Try reconnecting with fresh QR code'
      ],
      rpcUrl: 'https://mainnet.base.org',
      chainId: 8453
    },
    coinbase: {
      name: 'Coinbase Wallet',
      steps: [
        'Update Coinbase Wallet to latest version',
        'Verify Base network is enabled in wallet settings',
        'Toggle wallet connection off and on',
        'Reinstall app if connection issues persist'
      ],
      rpcUrl: 'https://mainnet.base.org',
      chainId: 8453
    }
  };

  const guide = walletGuides[walletType?.toLowerCase()] || walletGuides.metamask;
  res.json({ wallet: guide, error });
});

// Route: API - Gas fee optimization
app.post('/api/diagnose/gas', (req, res) => {
  const { gasPrice, gasLimit, txType } = req.body;
  
  const optimization = {
    currentEstimate: {
      gasPrice: gasPrice || 1000000,
      gasLimit: gasLimit || 21000,
      estimatedCost: (gasPrice || 1000000) * (gasLimit || 21000) / 1e18 + ' ETH'
    },
    tips: [
      'Use Base network for cheaper gas fees than Ethereum mainnet',
      'Batch transactions when possible to save on gas',
      'Send during off-peak hours for lower gas prices',
      'Avoid complex contract interactions if not necessary',
      'Monitor gas tracker on Basescan'
    ],
    recommendation: 'Base Layer 2 typically costs 1-10% of Ethereum mainnet gas fees'
  };

  res.json(optimization);
});

// Route: API - Smart contract interaction
app.post('/api/diagnose/smartcontract', (req, res) => {
  const { contractAddress, errorMessage, functionName } = req.body;
  
  const troubleshooting = {
    contractAddress,
    functionName,
    commonErrors: {
      'reverted with reason': 'Smart contract execution failed - check contract logic',
      'insufficient balance': 'Account lacks funds for transaction',
      'allowance exceeded': 'Token approval limit reached',
      'invalid address': 'Check contract address format',
      'gas estimation failed': 'Contract may not exist or function signature incorrect'
    },
    steps: [
      'Verify contract address on Basescan',
      'Check if contract function exists and is callable',
      'Ensure you have approved token spend if needed',
      'Test with higher gas limit',
      'Review contract ABI for correct function parameters'
    ]
  };

  res.json(troubleshooting);
});

// Route: API - Bridging assets
app.post('/api/diagnose/bridge', (req, res) => {
  const { sourceChain, destinationChain, asset } = req.body;
  
  const bridgeInfo = {
    sourceChain,
    destinationChain,
    asset,
    supportedBridges: [
      { name: 'Stargate Finance', url: 'stargate.finance' },
      { name: 'Across', url: 'across.to' },
      { name: 'Synapse', url: 'synapseprotocol.com' },
      { name: 'Hop Protocol', url: 'hop.exchange' }
    ],
    steps: [
      'Select source and destination chains',
      'Enter amount to bridge',
      'Approve token spending (if ERC-20)',
      'Confirm transaction in wallet',
      'Wait for settlement (varies by bridge)',
      'Verify receipt on destination chain'
    ],
    warning: 'Always double-check addresses. Funds sent to wrong chain may be unrecoverable.',
    gasTip: 'Bridge fees vary. Compare gas costs across different bridges.'
  };

  res.json(bridgeInfo);
});

// Route: API - Token approvals
app.post('/api/diagnose/approval', (req, res) => {
  const { tokenAddress, spenderAddress, currentAllowance } = req.body;
  
  const approvalGuide = {
    tokenAddress,
    spenderAddress,
    currentAllowance: currentAllowance || 0,
    steps: [
      'Go to token contract on Basescan',
      'Use "Write Contract" tab (connect wallet)',
      'Find "approve" function',
      'Enter spender address',
      'Enter amount (use max uint256 for unlimited)',
      'Confirm transaction in wallet'
    ],
    safety: [
      'NEVER approve unknown contracts',
      'Verify spender address matches official protocol',
      'Use contract interaction tools only on official sites',
      'Check if existing approval is sufficient before re-approving',
      'Revoke old approvals to reduce risk'
    ],
    revoke: 'Set allowance to 0 to revoke approval'
  };

  res.json(approvalGuide);
});

// Route: API - All diagnostics summary
app.get('/api/diagnostics', (req, res) => {
  res.json({
    categories: [
      'transactions',
      'wallet-connection',
      'gas-fees',
      'smart-contracts',
      'bridging',
      'token-approvals'
    ],
    baseChainInfo: {
      chainId: 8453,
      rpcUrl: 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org',
      currency: 'ETH'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Crypto System Assistant running on http://localhost:${PORT}`);
});