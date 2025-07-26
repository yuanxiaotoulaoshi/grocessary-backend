import { Glossary } from 'src/glossary/schemas/glossary.schema';
export function transformGlossary(doc: Glossary) {
  return {
    id: doc._id.toString(),
    cnName: doc.cnName,
    enName: doc.enName,
    categoryLevel1: doc.categoryLevel1,
    categoryLevel2: doc.categoryLevel2,
  };
}