import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { parseEther, formatEther } from 'viem';
import { validateBody } from '../middleware/requestValidator.js';
import { publicClient, relayerWalletClient, relayerAccount } from '../../clients/monadClient.js';
import { db } from '../../db/database.js';
import { logger } from '../../utils/logger.js';

const claimSchema = z.object({
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid 20-byte EVM address'),
});

export async function faucetRoutes(fastify: FastifyInstance) {
  /**
   * 1-Tap Testnet Faucet Endpoint.
   * Sponsors native MON gas if needed and credits 1,000.00 AUSD test collateral.
   */
  fastify.post(
    '/api/v1/faucet/claim',
    { preHandler: validateBody(claimSchema) },
    async (request: FastifyRequest) => {
      const { recipientAddress } = request.body as z.infer<typeof claimSchema>;
      const target = recipientAddress.toLowerCase() as `0x${string}`;

      logger.info({ target }, 'Processing testnet faucet claim');

      let gasSponsorshipTxHash: string | null = null;
      let gasSponsored = false;

      // 1. Check if recipient has native MON for gas fees on Monad Testnet
      try {
        const recipientMonBalance = await publicClient.getBalance({ address: target });
        const relayerMonBalance = await publicClient.getBalance({ address: relayerAccount.address });

        // If recipient has less than 0.05 MON and relayer has sufficient funds, send gas
        if (recipientMonBalance < parseEther('0.05') && relayerMonBalance > parseEther('0.1')) {
          logger.info({ relayer: relayerAccount.address, recipient: target }, 'Sponsoring 0.05 MON gas to recipient');
          gasSponsorshipTxHash = await relayerWalletClient.sendTransaction({
            to: target,
            value: parseEther('0.05'),
          });
          gasSponsored = true;
          logger.info({ gasSponsorshipTxHash }, 'Gas sponsorship transaction confirmed');
        }
      } catch (gasErr) {
        logger.warn({ gasErr }, 'Could not sponsor onchain gas (relayer may have insufficient MON), proceeding with AUSD balance credit');
      }

      // 2. Credit 1,000.00 testnet AUSD balance in database
      const existingBalance = db.getBalance(target);
      const newBalance = (existingBalance <= 0 ? 1000 : existingBalance + 1000);
      db.setBalance(target, newBalance);

      logger.info({ target, newBalance }, 'Testnet AUSD balance updated successfully');

      return {
        success: true,
        data: {
          recipientAddress: target,
          claimedAusd: 1000.0,
          totalBalanceAusd: newBalance,
          gasSponsored,
          gasTxHash: gasSponsorshipTxHash,
        },
        recipientAddress: target,
        claimedAusd: 1000.0,
        totalBalanceAusd: newBalance,
        gasSponsored,
        gasTxHash: gasSponsorshipTxHash,
        timestamp: Date.now(),
      };
    }
  );

  /**
   * Query testnet balance for address.
   */
  fastify.get(
    '/api/v1/faucet/balance/:address',
    async (request: FastifyRequest<{ Params: { address: string } }>) => {
      const address = request.params.address.toLowerCase();
      const balance = db.getBalance(address);
      return {
        success: true,
        data: {
          address,
          balanceAusd: balance,
        },
        address,
        balanceAusd: balance,
        timestamp: Date.now(),
      };
    }
  );
}
