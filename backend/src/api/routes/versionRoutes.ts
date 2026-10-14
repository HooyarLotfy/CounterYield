import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';

export async function versionRoutes(fastify: FastifyInstance) {
  /**
   * Query latest mobile application version and update package metadata.
   */
  fastify.get('/api/v1/app/version', async () => {
    return {
      success: true,
      data: {
        versionCode: 1,
        versionName: '1.0.0',
        minSupportedVersionCode: 1,
        apkUrl: 'http://153.75.248.37:48392/api/v1/app/download/counteryield-v1.0.0.apk',
        releaseNotes: 'CounterYield on Monad Testnet: 1-Tap Delta-Neutral Carry, Passkey Security & In-App Auto Updates.',
        publishedAt: Date.now(),
      },
      timestamp: Date.now(),
    };
  });

  /**
   * Direct APK download endpoint for standalone Android sideloading.
   */
  fastify.get(
    '/api/v1/app/download/:filename',
    async (request: FastifyRequest<{ Params: { filename: string } }>, reply: FastifyReply) => {
      const { filename } = request.params;
      // Sanitize filename to prevent path traversal
      const safeFilename = path.basename(filename);
      const possibleDirs = [
        path.resolve(process.cwd(), 'public', 'downloads'),
        path.resolve(process.cwd(), 'data', 'downloads'),
      ];

      let targetPath: string | null = null;
      for (const dir of possibleDirs) {
        const candidate = path.join(dir, safeFilename);
        if (fs.existsSync(candidate)) {
          targetPath = candidate;
          break;
        }
      }

      if (!targetPath) {
        return reply.status(404).send({
          success: false,
          error: { code: 'APK_NOT_FOUND', message: `APK file ${safeFilename} is not yet uploaded to the server.` },
        });
      }

      const stat = fs.statSync(targetPath);
      reply.header('Content-Type', 'application/vnd.android.package-archive');
      reply.header('Content-Disposition', `attachment; filename="${safeFilename}"`);
      reply.header('Content-Length', stat.size);
      return reply.send(fs.createReadStream(targetPath));
    }
  );
}
