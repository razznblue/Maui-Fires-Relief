import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({schemaOptions: {collection: "Admin", versionKey: false, timestamps: true}})
export class Admin {
  @prop()
  username: string;

  @prop()
  password: string;
}