import { CheerioAPI, load } from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// const sheetIds = [194434303, 0, 120027051, 2532397];
const sheetIds = [194434303];

const scrapeGoogleSheet = async (url: string) => {
  try {

    const response = await axios.get(url);
    const $: CheerioAPI = load(response.data);

    const data: any = [];

    for (const sheetId of sheetIds) {
      const sheetData: any = {}
      sheetData.title = 'Help Maui Rise: Directly aid `Ohana displaced by the fires';
      sheetData.rowCount = 0;
      sheetData.rows = [];

      $(`#${sheetId} div table tbody tr`).each((i, row) => {
        const columns = $(row).find('td');
        if (columns.length === 3 || columns.length === 4) {

          /* Donate Directly to Maui ʻOhana */
          if (isFirstSheet(sheetId) && $(columns[1]).text() !== 'Donation Link'
            && !$(columns[0]).attr('class')?.includes('freezebar') && $(columns[0]).text().trim() !== '') {
            sheetData.rowCount++;
            sheetData.rows.push({
              name: $(columns[0]).text().trim(),
              donationLabel: $(columns[1]).text().trim(),
              donationLink: $(columns[1]).find('a').attr('href'),
              description: $(columns[2]).text().trim()
            })
          }

          // /* Community Funds ($) */
          // if (isSecondSheet(sheetId) && $(columns[0]).text().trim() !== 'Organization' 
          //   && $(columns[0]).text().trim() !== '') {
          //   sheetData.rowCount++;
          //   let aTags = $(columns[0]).find('span a');

          //   if ($(aTags[0]).attr('href') !== undefined) {
          //     sheetData.rows.push({
          //       name: $(columns[0]).text().trim(),
          //       orgWebsite: $(aTags[0]).attr('href'),
          //       socialMediaLink: $(aTags[1]).attr('href'),
          //     })
          //   } else { // Handle columns that don't have a span element b/t <td> and <a>, annoying!
          //     aTags = $(columns[0]).find('a');
          //     sheetData.rows.push({
          //       name: $(columns[0]).text().trim(),
          //       orgWebsite: $(aTags[0]).attr('href')
          //     })
          //   }
          // }

          // /* Oʻahu Donation Drop-Offs */
          // if (isThirdSheet(sheetId) && $(columns[0]).text().trim() !== 'Organization' 
          //   && $(columns[0]).text().trim() !== '') {
          //   sheetData.rowCount++;
          //   console.log($(columns[2]).text());
          //   sheetData.rows.push({
          //     name: $(columns[0]).text().trim(),
          //     orgWebsite: $(columns[0]).find('a').attr('href'),
          //     addresses: $(columns[1]).html(),
          //     hours: $(columns[2]).text(),
          //     donationsNeeded: $(columns[3]).text().trim(),
          //   })
          //   //addAddressAndHoursInfo(sheetData.rows, $(columns[1]).text(), $(columns[2]).text());
          // }

          // /* Small Businesses Supporting Maui */
          // if (isFourthSheet(sheetId)) {
            
          // }

        }
      })
      data.push(sheetData);
    }
    
    const filePath = path.join(process.cwd(), 'output.json');
    await fs.promises.writeFile(filePath, '');
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

const isFirstSheet = (sheetId: number) => {return sheetId === sheetIds[0] ? true : false}
const isSecondSheet = (sheetId: number) => {return sheetId === sheetIds[1] ? true : false}
const isThirdSheet = (sheetId: number) => {return sheetId === sheetIds[2] ? true : false}
const isFourthSheet = (sheetId: number) => {return sheetId === sheetIds[3] ? true : false}

const getTitle = ($: any, sheetId: number) => {
  let textToReturn = '';
  $('#sheet-menu li').each((i: any, item: any) => {
    if (item.attribs.id === `sheet-button-${sheetId}`) {
      textToReturn = $(item).find('a').text().trim();
    }
  })
  return textToReturn;
}

export default async function handler(req: any, res: any) {
  res.send('Scraping Data..');
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1lExatubPl6zvsDcy4qUd3Sv1PvvKrzMhUyOzaKuId0o/htmlview';
  scrapeGoogleSheet(sheetUrl);
}

