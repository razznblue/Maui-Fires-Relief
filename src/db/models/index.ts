import { getModelForClass } from '@typegoose/typegoose';
import { Sheet } from './Sheet';

export const SheetModel = getModelForClass(Sheet);