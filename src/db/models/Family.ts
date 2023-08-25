import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({schemaOptions: {collection: "Family", versionKey: false, timestamps: true}})
export class Family {

  @prop()
  name: string;

  @prop()
  donationLabel: string;

  @prop()
  donationLink: string;

  @prop()
  goFundMeLink: string;

  @prop()
  goFundMeImgUrl: string;

  @prop()
  goFundMeGoal: string;

  @prop()
  goFundMeRaisedAmount: string;

  @prop()
  description: string;

}