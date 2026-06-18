import { Request, Response } from 'express';
import { processSupportQuery } from './support.service';

export const supportChat = async (
  req: Request,
  res: Response,
) => {
  try {
    const { message } = req.body;

    // Get from JWT middleware
    const userId = req.user.id;

    const result = await processSupportQuery(
      userId,
      message,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};