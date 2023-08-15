// import { GoogleSpreadsheet } from 'google-spreadsheet';
// import { JWT } from 'google-auth-library';
// import fs from 'fs';

// export default async function handler(req: any, res: any) {
//   res.send('Processing Sheets..');
  
//   // Fields
//   const spreadsheetId = "1lExatubPl6zvsDcy4qUd3Sv1PvvKrzMhUyOzaKuId0o";
//   const sheetIds = [194434303, 0, 120027051, 2532397];
//   const CREDS = JSON.parse(fs.readFileSync('credentials.json') as any);

//   /* Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication */
//   const serviceAccountAuth = new JWT({
//     email: CREDS.client_email,
//     key: CREDS.private_key,
//     scopes: 'https://www.googleapis.com/auth/spreadsheets',
//   });
//   const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
//   await doc.loadInfo(true);
//   const sheetCount = doc.sheetCount;
//   console.log(`Found ${sheetCount} sheets`);

//   /* Compile data 1 by 1 for each Sheet */
//   const ALL_DATA = [];
//   for (const sheetId of sheetIds) {
//     const sheetItem: any = {}
//     const sheet = doc.sheetsById[sheetId];
//     sheetItem.title = sheet.title;
//     sheetItem.rowCount = sheet.rowCount;
//     sheetItem.rows = [];
  
//     await sheet.loadCells();
  
//     let cellRange = process.env.CELL_RANGE || 'A3:D800';
//     if (sheetId === sheetIds[0]) cellRange = 'A3:C1000';
//     if (sheetId === sheetIds[1]) cellRange = 'A3:C200';
//     if (sheetId === sheetIds[2]) cellRange = 'A3:D200';
//     if (sheetId === sheetIds[3]) cellRange = 'A3:B200';
//     console.log(`Searching through cellRange ${cellRange} on sheet ${sheetId}`);
    
//     const cells = await sheet.getCellsInRange(cellRange);
//     for (const cell of cells) {
//       // Donate Directly to Maui `Ohana
//       if (sheetId === sheetIds[0]) {
//         sheetItem.rows.push({
//           name: cell[0],
//           donationType: cell[1],
//           description: cell[2]
//         })
//       }

//       // Community Funds ($)
//       if (sheetId === sheetIds[1]) {
//         sheetItem.rows.push({
//           name: cell[0],
//           donationType: cell[1],
//           description: cell[2]
//         })
//       }

//       // O`ahu Donation Drop-Offs
//       if (sheetId === sheetIds[2]) {
//         sheetItem.rows.push({
//           name: cell[0],
//           dropOffAddress: cell[1],
//           hours: cell[2],
//           donationsNeeded: cell[3]
//         })
//       }

//       // Small Businesses Supporting Maui
//       if (sheetId === sheetIds[3]) {
//         sheetItem.rows.push({
//           name: cell[0],
//           description: cell[1]
//         })
//       }
//     }
//     sheetItem.rowCount = sheetItem.rows.length;

//     /* Extract raw text from cells and organize them */
//     const markedCells = [];
//     await fs.promises.writeFile('cells.json', '');
//     const cellA1Addresses = generateAddressesInRange(cellRange);

//     for (let i = 0; i < cellA1Addresses.length; i++) {
//       const currentCellAddress = cellA1Addresses[i];
//       const previousCellAddress = cellA1Addresses[i - 1 < 0 ? i : i - 1];
//       const currentCell = sheet.getCellByA1(currentCellAddress);
//       const previousCell = sheet.getCellByA1(previousCellAddress)
//       if (sheetId === sheetIds[1] && currentCell.stringValue !== undefined && currentCell.hyperlink !== undefined) {
//         // console.log(`${previousCell.stringValue} : ${previousCell.hyperlink}: ${previousCell.hyperlinkDisplayType}`);
//         markedCells.push({
//           a1Address: currentCell?.a1Address,
//           hyperlink: currentCell?.hyperlink,
//           matchText: currentCell?.stringValue
//         })
//       }
//       if (currentCell?.hyperlink && (previousCell?.stringValue || currentCell?.stringValue)) {
//         markedCells.push({
//           a1Address: currentCell?.a1Address,
//           hyperlink: currentCell?.hyperlink,
//           matchText: sheetId === sheetIds[0] ? previousCell?.stringValue : currentCell?.stringValue
//         })
//       } else if (sheetId === sheetIds[1]) { // Handle special case for sheet 2
//         markedCells.push({
//           a1Address: previousCell?.a1Address,
//           hyperlink: previousCell?.hyperlink,
//           matchText: previousCell?.stringValue
//         })
//       }
//     }
//     if (sheetId === sheetIds[1]) {
//       await fs.promises.appendFile('cells.json', JSON.stringify(markedCells, null, 2));
//     }

//     /* Match donation link to respective entry */
//     for (const originCell of sheetItem.rows) {
//       for (const markedCell of markedCells) {
//         if (sheetId === sheetIds[1]) {
//           if (originCell.name === markedCell.matchText) {
//             // console.log(`originCell: ${originCell.name} - markedCell: ${markedCell.matchText}`);
//             // console.log('new');
//             // console.log(originCell);
//             // console.log(markedCell);
//           }
//         } else if (originCell.name === markedCell.matchText) {
//           originCell.donationLink = markedCell.hyperlink;
//         }
//       }
//     }

//     /* Locate any missed donation links for `Ohana */
//     const missingDonationLinks = [];
//     if (sheetId === sheetIds[0]) {
//       for (const cell of sheetItem.rows) {
//         if (cell?.donationLink === undefined) {
//           // console.log(`DonationLink missing for ${cell.name}`)
//           missingDonationLinks.push(cell.name);
//         }
//       }
//     }
    
//     /* Add organized data */
//     sheetItem.missingDonationLinks = missingDonationLinks;
//     ALL_DATA.push(sheetItem);
//   }


//   await fs.promises.writeFile('data.json', JSON.stringify(ALL_DATA, null, 2));
// }


// /* Helper Functions */
// function generateAddressesInRange(range: string) {
//   const [startCell, endCell] = range.split(":");
//   const [startCol, startRow] = extractColAndRow(startCell);
//   const [endCol, endRow] = extractColAndRow(endCell);

//   const addresses = [];

//   for (let row = startRow; row <= endRow; row++) {
//     for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
//       const colLetter = String.fromCharCode(col);
//       const address = colLetter + row;
//       addresses.push(address);
//     }
//   }

//   return addresses;
// }

// function extractColAndRow(cell: any) {
//   const col = cell.match(/[A-Z]+/)[0];
//   const row = parseInt(cell.match(/\d+/)[0]);
//   return [col, row];
// }


