import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

export default model("Review", reviewSchema);