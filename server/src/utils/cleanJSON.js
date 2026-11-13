// Pass as a schema's toJSON option so API responses show "id" instead of
// MongoDB's "_id" and "__v". Example:
//   new mongoose.Schema({ ... }, { timestamps: true, toJSON: cleanJSON })
export const cleanJSON = {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};
