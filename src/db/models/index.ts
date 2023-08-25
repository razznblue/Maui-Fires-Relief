import { getModelForClass } from '@typegoose/typegoose';
import { Sheet } from './Sheet';
import { Family } from './Family';
import { Admin } from './Admin';

export const SheetModel = getModelForClass(Sheet);
export const FamilyModel = getModelForClass(Family);
export const AdminModel = getModelForClass(Admin);