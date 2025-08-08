// update new property 'currentMetadata' in Glossary table;
import { connect, connection } from 'mongoose';
import { GlossarySchema } from '../glossary/schemas/glossary.schema';

(async () => {
    await connect(
        'mongodb+srv://ycong5547:cong19980912@cluster0.irwpbiq.mongodb.net/glossary_db?retryWrites=true&w=majority&appName=Cluster0',
        {
            connectTimeoutMS: 30000,
        }
    );
  
    const Glossary = connection.model('Glossary', GlossarySchema);
  
    const result = await Glossary.updateMany(
      { currentMetadata: { $exists: false } },
      { $set: { currentMetadata: '' } }
    );
  
    console.log(`已更新 ${result.modifiedCount} 条记录`);
  
    await connection.close();
  })();