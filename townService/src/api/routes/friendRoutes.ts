import { Router, Request, Response } from 'express';
import prisma from '../repositories/PrismaClient';
import * as friendService from '../services/friendService';

const router = Router();

router.get('/hello', (req: Request, res: Response) => {
  console.log('Hello route called!');
  res.json({ message: 'Hello, world!' });
});

/**
 * GET /api/friends/:userID
 * Get all friends of a user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The list of friends.
 */
router.get('/:userID', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            userID1: userID,
          },
          {
            userID2: userID,
          },
        ],
      },
    });

    res.status(200).json(friends);
  } catch (error) {
    res.status(500).send(`Error retrieving friendships: ${error}`);
  }
});

/**
 * POST /api/friends/requests
 * Create a friend request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A success message.
 */
router.post('/requests', async (req: Request, res: Response) => {
  const { userID1, userID2 } = req.body;
  try {
    await prisma.friendRequest.create({
      data: {
        userID1,
        userID2,
        accept: false,
      },
    });

    res.status(201).send('Friend request created');
  } catch (error) {
    res.status(500).send(`Error creating friend request: ${error}`);
  }
});

/**
 * GET /api/friends/requests/:userID
 * Get incoming and outgoing friend requests of a user.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The list of incoming and outgoing friend requests.
 */
router.get('/requests/:userID', async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    const incoming = await prisma.friendRequest.findMany({
      where: {
        userID2: userID,
      },
      select: {
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    const outgoing = await prisma.friendRequest.findMany({
      where: {
        userID1: userID,
      },
      select: {
        receiver: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    res.status(500).send(`Error retrieving friendships: ${error}`);
  }
});

/**
 * PATCH /api/friends/requests
 * Accept or reject a friend request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A success message.
 */
router.patch('/requests', async (req: Request, res: Response) => {
  const { requesterID, receiverID, accept } = req.body;

  try {
    await prisma.friendRequest.delete({
      where: {
        userID1_userID2: {
          userID1: requesterID,
          userID2: receiverID,
        },
      },
    });

    if (accept) {
      await friendService.createFriendship(requesterID, receiverID);
      res.status(200).send('Friendship created');
    }

    res.status(200).send('Friend request deleted');
  } catch (error) {
    res.status(500).send(`Error creating friendship: ${error}`);
  }
});

/**
 * GET /api/friends/search/:searchTerm
 * Search for users by display name.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns The list of users matching the search term.
 */
router.get('/search/:searchTerm', async (req: Request, res: Response) => {
  const { searchTerm } = req.params;

  try {
    const users = await prisma.user.findMany({
      where: {
        displayName: {
          contains: searchTerm,
        },
      },
      select: {
        id: true,
        displayName: true,
      },

      take: 10,
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(`Error searching users: ${error}`);
  }
});

export default router;
