import { Schema, model } from 'mongoose';

const hotelSchema = new Schema(
    {
        business: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        star_rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        images: [
            { type: String }, // S3 URL
        ],
        amenities_list: [
            { type: String },
        ],
    },
    { timestamps: true }
);

export default model('Hotel', hotelSchema);