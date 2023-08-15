import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/db/db';
import { SheetModel } from '@/db/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // if (req.method === 'POST') {
    //   const data = req?.body;
    //   if (!data) return res.status(400).json({ error: 'Data is required' });

    //   const exists = await SheetModel.exists({title: data?.title});
    //   if (!exists) {
    //     const newSheet = new SheetModel(data);
    //     await newSheet.save();
    //     return res.status(201).json({ message: `Saved new sheet: ${data?.title} with ID ${newSheet._id}` });
    //   } 
    //   return res.status(409).send(`Sheet ${data?.title} already exists`);

    // } 
    if (req.method === 'GET') {
      return res.send(await SheetModel.find({}).sort({ createdAt: -1 }).limit(5));
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ error: 'An error occurred while saving data' });
  }
}
