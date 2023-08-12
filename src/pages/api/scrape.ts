import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
const CREDS = JSON.parse(fs.readFileSync('credentials.json') as any);


export default async function handler(req: any, res: any) {
  res.send('Processing Sheets');

  const spreadsheetId = "1lExatubPl6zvsDcy4qUd3Sv1PvvKrzMhUyOzaKuId0o";
  const sheetIds = [194434303, 0, 120027051, 2532397];

  // Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
  const serviceAccountAuth = new JWT({
    email: CREDS.client_email,
    key: CREDS.private_key,
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  await doc.loadInfo(true);
  const sheetCount = doc.sheetCount;
  console.log(`Found ${sheetCount} sheets`);

  // Compile data 1 by 1 for each Sheet
  const rowData = [];
  for (const sheetId of sheetIds) {
    const sheetItem: any = {}
    const sheet = doc.sheetsById[sheetId];
    sheetItem.title = sheet.title;
    sheetItem.rowCount = sheet.rowCount;
    sheetItem.rows = [];
  
    await sheet.loadCells();
    
    let cellRange = process.env.CELL_RANGE || 'A3:D600';
    if (sheetId === sheetIds[0]) cellRange = 'A3:C800';
    if (sheetId === sheetIds[1]) cellRange = 'A3:C100';
    if (sheetId === sheetIds[2]) cellRange = 'A3:D100';
    if (sheetId === sheetIds[3]) cellRange = 'A3:B100';
    console.log(`Searching through cellRange ${cellRange} on sheet ${sheetId}`);
    
    const cells = await sheet.getCellsInRange(cellRange);
    
    for (const cell of cells) {
      // Donate Directly to Maui `Ohana
      if (sheetId === sheetIds[0]) {
        sheetItem.rows.push({
          name: cell[0],
          donationType: cell[1],
          description: cell[2]
        })
      }

      // Community Funds ($)
      if (sheetId === sheetIds[1]) {
        sheetItem.rows.push({
          name: cell[0],
          donationType: cell[1],
          description: cell[2]
        })
      }

      // O`ahu Donation Drop-Offs
      if (sheetId === sheetIds[2]) {
        sheetItem.rows.push({
          name: cell[0],
          dropOffAddress: cell[1],
          hours: cell[2],
          donationsNeeded: cell[3]
        })
      }

      // Small Businesses Supporting Maui
      if (sheetId === sheetIds[3]) {
        sheetItem.rows.push({
          name: cell[0],
          description: cell[1]
        })
      }
    }
    sheetItem.rowCount = sheetItem.rows.length;

    const markedCells = [];

    const cellA1Addresses = generateAddressesInRange(cellRange);
    for (let i = 0; i < cellA1Addresses.length; i++) {
      const currentCellAddress = cellA1Addresses[i];
      const previousCellAddress = cellA1Addresses[i - 1 < 0 ? i : i - 1];
      const currentCell = sheet.getCellByA1(currentCellAddress);
      const previousCell = sheet.getCellByA1(previousCellAddress)
      if (currentCell?.hyperlink && (previousCell?.stringValue || currentCell?.stringValue)) {
        markedCells.push({
          a1Address: currentCell?.a1Address,
          hyperlink: currentCell?.hyperlink,
          matchText: sheetId === sheetIds[0] ? previousCell?.stringValue : currentCell?.stringValue
        })
      }
    }

    for (const originCell of sheetItem.rows) {
      for (const markedCell of markedCells) {
        if (originCell.name === markedCell.matchText) {
          originCell.donationLink = markedCell.hyperlink;
        }
      }
    }

    rowData.push(sheetItem);

    // const rows = await sheet.getRows();
    // for (const row of rows) {
    //   const col1Value = row.get('**Last updated: 8/11/2023, 2:00PM');
    //   const col2Value = row.get('Please reach out to @kennareed, @ssamakaio, @gwubby if you know of any more funds to add to this list!');
    //   // console.log(row.get('**Last updated: 8/11/2023, 2:00PM'));
    //   rowData.push({
    //     name: col1Value,
    //     second: col2Value
    //   });
    // }

  }

  await fs.promises.writeFile('data.json', JSON.stringify(rowData, null, 2));

}


/* Helper Functions */
function generateAddressesInRange(range: string) {
  const [startCell, endCell] = range.split(":");
  const [startCol, startRow] = extractColAndRow(startCell);
  const [endCol, endRow] = extractColAndRow(endCell);

  const addresses = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
      const colLetter = String.fromCharCode(col);
      const address = colLetter + row;
      addresses.push(address);
    }
  }

  return addresses;
}

function extractColAndRow(cell: any) {
  const col = cell.match(/[A-Z]+/)[0];
  const row = parseInt(cell.match(/\d+/)[0]);
  return [col, row];
}

const findMatchingCell = (cellText: string, cells: any) => {
  for (const cell of cells) {
    if (cellText === cell) {
      return cell;
    }
  }
}


