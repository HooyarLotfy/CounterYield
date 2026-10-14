module.exports = {
  apps: [
    {
      name: 'counteryield-backend',
      script: './dist/index.js',
      cwd: '/var/www/counteryield-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 48392,
        HOST: '0.0.0.0',
        MONAD_RPC_URL: 'https://testnet-rpc.monad.xyz',
        CHAIN_ID: 10143,
        PERPL_API_URL: 'https://testnet.perpl.xyz/api',
        PERPL_WS_URL: 'wss://testnet.perpl.xyz/ws',
        PERPL_MARKET_ID_MON: 64,
        KURU_MARKET_MON_USDC: '0xa241896A7Dbe8a550D2E5fF7A914bB1989ceD2D9',
        CARRY_LEDGER_ADDRESS: '0x9998a7776edddf2f2ab6ffbb9420e5194a50f906',
        AUSD_ADDRESS: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'
      },
      node_args: '--max-old-space-size=1024',
      max_memory_restart: '1024M',
      restart_delay: 3000,
      autorestart: true
    }
  ]
};
