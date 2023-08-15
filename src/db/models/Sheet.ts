import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({schemaOptions: {versionKey: false, timestamps: false, _id: false}})
export class Row {
  @prop()
  name: string;

  @prop()
  donationLabel: string;

  @prop()
  donationLink: string;

  @prop()
  description: string;
}


@modelOptions({schemaOptions: {collection: "Sheet", versionKey: false, timestamps: true}})
export class Sheet {

  @prop()
  title: string;

  @prop()
  rowCount: number;

  @prop()
  rows: Row[];

}