import { SheetModel } from "@/db/models";
import dbConnect from "@/db/db";
import { NextApiRequest, NextApiResponse } from "next";
import { throw404, handleUnexpectedError } from "@/utils/apiHelper";
const ObjectId = require('mongoose').Types.ObjectId;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    const id: any = req?.query?.sheetId;
    if (!ObjectId.isValid(id)) { return res.send(`Invalid ObjectID`) };

    /* GET Sheet by ID */
    if (req?.method === 'GET' && id) {
      try {
        const record = await SheetModel.findById(id);
        if (!record) { return throw404(res, `Sheet with Id ${id} not found`) }
        return res.send(record);
      } catch(err) {
        return handleUnexpectedError(res, err);
      }
    }

    /* UPDATE Sheet by ID */
    // if (req?.method === 'PATCH' && id) {
    //   try {
    //     const record: any = await SheetModel.findById(id).exec();
    //     if (!record) return throw404(res, `Sheet with ID ${id} does not exist`);
    //     if (record) {
    //       const updatedKeys: string[] = [];
    //       for (const [key, value] of Object.entries(req?.body)) {
    //         if (record[key] !== undefined) {
    //           record[key] = value;
    //           updatedKeys.push(key);
    //         }
    //       }
    //       record.save();
    //       console.log(`Updated player with fields [${updatedKeys}]`);
    //       return res.send(record);
    //     }
    //   } catch(err) {
    //     return handleUnexpectedError(res, err);
    //   }
    // }

    /* DELETE Record by ID */
    // if (req.method === 'DELETE' && id) {
    //   try {
    //     /* Delete Sheet Info */
    //     const sheet = await SheetModel.findByIdAndDelete(id);
  
    //     /* Determine if records are actually deleted */
    //     const deleted = sheet ? true : false;

    //     /* On Success */
    //     if (deleted) {
    //       console.log('Deleted Sheet info');
    //       return res.send(sheet);
    //     }

    //     /* Handle 404s */
    //     if (!sheet) {return handleDeletionResponse('Sheet', res)}

    //     res.status(500).send('Unexpected Error Occurred');
    //   } catch(err) {
    //     console.warn(`Error deleting Sheet Info`, err);
    //     res.status(500).send({title: `Error deleting Sheet Info`, error: err});
    //   }
    // }

    return res.status(400).json({ err: `Cannot perform request with method ${req.method}` });
  } catch(err) {
    return handleUnexpectedError(res, err);
  }
}

// const handleDeletionResponse = (model: string, res: any) => {
//   console.warn(`${model} marked for deletion not found`);
//   return throw404(res, `${model} marked for deletion not found`);
// }