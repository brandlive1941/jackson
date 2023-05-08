import type { NextApiRequest, NextApiResponse } from 'next';
import jackson from '@lib/jackson';
import { sendAudit } from '@ee/audit-log/lib/retraced';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'PATCH':
      return await handlePATCH(req, res);
    case 'GET':
      return await handleGET(req, res);
    case 'DELETE':
      return await handleDELETE(req, res);
    default:
      res.setHeader('Allow', 'GET, PATCH, DELETE');
      res.status(405).json({ error: { message: `Method ${method} Not Allowed` } });
  }
};

// Update a directory configuration
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const { directorySyncController } = await jackson();

  const { directoryId } = req.query as { directoryId: string };

  const { data, error } = await directorySyncController.directories.update(directoryId, req.body);

  if (data) {
    sendAudit({
      action: 'dsync.connection.update',
      crud: 'u',
      req,
    });

    return res.status(200).json({ data });
  }

  if (error) {
    return res.status(error.code).json({ error });
  }
};

// Get a directory configuration
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { directorySyncController } = await jackson();

  const { directoryId } = req.query as { directoryId: string };

  const { data, error } = await directorySyncController.directories.get(directoryId);

  sendAudit({
    action: 'dsync.connection.view',
    crud: 'r',
    req,
  });

  if (data) {
    return res.status(200).json({ data });
  }

  if (error) {
    return res.status(error.code).json({ error });
  }
};

// Delete a directory configuration
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { directorySyncController } = await jackson();

  const { directoryId } = req.query as { directoryId: string };

  const { error } = await directorySyncController.directories.delete(directoryId);

  if (error) {
    return res.status(error.code).json({ error });
  }

  sendAudit({
    action: 'dsync.connection.delete',
    crud: 'd',
    req,
  });

  return res.json({ data: null });
};

export default handler;
