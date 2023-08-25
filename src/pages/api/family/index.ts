import { FamilyModel } from '@/db/models';
import dbConnect from '@/db/db';

export default async function handler(req: any, res: any) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const families = await FamilyModel.find({});
      return res.send(families);
    } catch (error) {
      console.error('Error fetching families:', error);
      return res.status(500).json({ error: 'Failed to fetch families' });
    }
  } else {
    console.log(`Method ${req?.method} not allowed`);
    return res.status(400).json({ error: `Method ${req?.method} not allowed` });
  }

}
