import fs from 'fs';
import { FamilyModel } from '@/db/models';
import { AdminModel } from '@/db/models';
import dbConnect from '@/db/db';
import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import UserAgent from 'user-agents';

export default async function handler(req: any, res: any) {
  const jobExecutionTimeName = 'CronJob | MFR-Family';

  if (req?.method === 'POST') {
    console.log('Received Request to process Families');
    
    try {
      await dbConnect();
      const username = req?.body?.username;
      const password = req?.body?.password;
      if (!username || !password) {
        console.warn('Authentication Invalid. Families were not processed')
        return res.status(400).send('Authentication Invalid. Families were not processed')
      }
      const admin = await AdminModel.findOne({ username: username, password: password });
      if (!admin) {
        console.warn('Unauthorized Invalid. Families were not processed')
        return res.status(401).send('Unauthorized. Families were not processed');
      } 
      
      console.time(jobExecutionTimeName);
      /* At this point authorization is finished. Continue with normal logic */
      res.send('Processing Families');

      const data = await fs.promises.readFile('output.json', 'utf8');
      if (!data) return res.status(400).send('No Family Data Found To Process');

      const parsedData: any = JSON.parse(data);
      const families = parsedData[0].rows;

      /* Process Families in batches */
      const batchSize = 100;
      const familyCount = families.length;
      const pages = Math.ceil(families.length / batchSize);
      console.log(`${pages} pages to process`);

      for (let i = 0; i < families.length; i += batchSize) {
        const batch = families.slice(i, i + batchSize);
        await Promise.all(batch.map(processFamily));
        const endIndex = Math.min(i + batchSize - 1, familyCount - 1);
        console.log(`Page ${i / batchSize + 1} of ${pages} finished processing from index ${i} to ${endIndex}`);
      }
      console.timeEnd(jobExecutionTimeName);
      console.log(`Finished saving all families`);

    } catch(err: any) {
      console.error('error....');
      console.error('Unexpected Error: ' + err?.message)
    }
  } else {
    console.error(`Method ${req?.method} is not allowed`)
    res.send(`Method ${req?.method} is not allowed`)
  }
}

const processFamily = async (family: any) => {
    const existingFamily = await FamilyModel.findOne({name: family.name});
    if (!existingFamily) {
      const newFamily = new FamilyModel({
        name: family.name,
        donationLabel: family.donationLabel,
        donationLink: family.donationLink,
        description: family.description
      })
      if (family?.donationLabel?.toLowerCase().includes('gofundme')
        && (family?.donationLink?.toLowerCase().includes('gofund.me') || family?.donationLink?.toLowerCase().includes('gofundme.com'))) {
          // console.log(`Processing family with label: ${family.donationLabel}, link: ${family.donationLink}`);
        const goFundMeData = await scrapeGoFundMe(newFamily);
        newFamily.goFundMeGoal = goFundMeData?.goFundMeGoal || '';
        newFamily.goFundMeRaisedAmount = goFundMeData?.goFundMeRaisedAmount || '';
        newFamily.goFundMeImgUrl = goFundMeData?.goFundMeImgUrl || '';
      }
      await newFamily.save();
      console.log(`Saved new family with name ${newFamily.name}`);
      return;
    }
    if (existingFamily?.donationLabel?.toLowerCase().includes('gofundme') 
      && (family?.donationLink?.toLowerCase().includes('gofund.me') || family?.donationLink?.toLowerCase().includes('gofundme.com'))) {
      const goFundMeData = await scrapeGoFundMe(existingFamily);
      existingFamily.goFundMeGoal = goFundMeData?.goFundMeGoal || '';
      existingFamily.goFundMeRaisedAmount = goFundMeData?.goFundMeRaisedAmount || '';
      existingFamily.goFundMeImgUrl = goFundMeData?.goFundMeImgUrl || '';
      existingFamily.goFundMeLink = goFundMeData?.goFundMeUrl || '';
      await existingFamily.save();
    } 
}

/* Helper Functions */
const extractGoFundMeUrl = (fullUrl: string) => {
  try {
    const urlObject = new URL(fullUrl);
    const searchParams = new URLSearchParams(urlObject.search);
    const firstQueryParam = searchParams.get(searchParams.keys().next().value);
    return firstQueryParam;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return '';
  }
}

const scrapeGoFundMe = async (family: any) => {
  if (family.donationLink.includes("gofund")) {
    try {
      const url = extractGoFundMeUrl(family.donationLink);
      if (url) {
        const response = await axios.get(url, {
          headers: { 'User-Agent': new UserAgent().random().toString() }
        });
        const $: CheerioAPI = load(response.data);
    
        const amountRaised = $('.o-campaign-sidebar-wrapper div .progress-meter_progressMeter__ebbGu .progress-meter_progressMeterHeading__7dug0 div').text().trim();
        const goalAmount = $('.o-campaign-sidebar-wrapper div .progress-meter_progressMeter__ebbGu .progress-meter_progressMeterHeading__7dug0 span').text().trim();
        const imgUrl = $('.t-campaign-page-template-content .p-campaign .p-campaign-collage .m-collage-image .a-image').attr('style')
    
        return {
          goFundMeGoal: extractGoalAmount(goalAmount) || '',
          goFundMeRaisedAmount: amountRaised,
          goFundMeImgUrl: extractImageUrl(imgUrl) || '',
          goFundMeUrl: url
        }
    
      } else {
        console.warn(`Malformed URL ${url} while processing GoFundMe for family ${family.name}`);
      }
    } catch(err: any) {
      console.error(`Failed to scrape GoFundMe for family: ${family?.name}`, err?.message, err?.response?.statusText);
    }
  }
}

const extractGoalAmount = (text: string): string | null => {
  const splitArray = text.split(" ");
  const index = splitArray.findIndex(item => item.includes("goal"));
  if (index !== -1 && index > 0) {
    return splitArray[index - 1];
  }
  return null;
}

const extractImageUrl = (input: string | undefined) => {
  if (input === undefined) return null;
  const regex = /url\(["']?([^"')]+)["']?\)/;
  const match = input.match(regex);
  if (match && match.length > 1) {
    return match[1];
  }
  return null;
}