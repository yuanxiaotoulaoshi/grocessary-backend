import mongoose from 'mongoose';
import { ListenSchema } from '../listen/schemas/listen.schema';

(async () => {
  await mongoose.connect('mongodb+srv://ycong5547:cong19980912@cluster0.irwpbiq.mongodb.net/glossary_db?retryWrites=true&w=majority&appName=Cluster0');

  const collections = mongoose.model('Listen', ListenSchema);

  const docs = await collections.find({ collectedAt: { $exists: false } });

  for (const doc of docs) {
    doc.collectedAt = doc._id.getTimestamp();
    await doc.save();
  }

  console.log(`已更新 ${docs.length} 条记录`);
  await mongoose.disconnect();
})();
