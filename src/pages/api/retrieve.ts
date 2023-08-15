import { SheetModel } from '@/db/models';
import dbConnect from '@/db/db';
import fs from 'fs';
import path from 'path';
import RateLimiter from '@/utils/limiter';

const callsPerMinute = 2;
const limiter = new RateLimiter(callsPerMinute, 60 * 1000);

export default async function handler(req: any, res: any) {
  const fileName = 'output.json'
  const filePath = path.join(process.cwd(), fileName);
  const data = await fs.promises.readFile(filePath, 'utf8');
  await dbConnect();

  // Support for if output.json has no data
  if (!data) return await fetchMostRecentData(fileName, res);

  // Handle the file data as normal
  const parsedData = JSON.parse(data);
  try {
    await saveNewSheetRecord(parsedData[0]);
  } catch(err: any) {
    console.error(`Error Saving Sheet Upload to DB`, err?.message);
    return await fetchMostRecentData(fileName, res)
  }

  return res.json(data);
}

const saveNewSheetRecord = async (sheet: any) => {
  if (limiter.canCall()) {
    const newSheet = new SheetModel(sheet);
    await newSheet.save();
    console.log(`Saved new sheet: ${newSheet?.title} with ID ${newSheet._id}`);
  } else {
    console.log('Sheet creation rate limit exceeded for the next minute');
  }
}

const fetchMostRecentData = async (fileName: string, res: any) => {
  console.log(`Could not fetch data from ${fileName}. Fetching most recent data upload instead...`)
  const latest: any = await SheetModel.findOne().sort({ createdAt: -1 });
  const arr = [];
  arr.push(latest);
  console.log(`returning most recent data upload with _id of ${latest._id}`);
  return res.json(JSON.stringify(arr, null, 2));
}