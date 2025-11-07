import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
    team: {
        type: {
            id: {
                type: Number,
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            code: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            founded: {
                type: Number,
                required: true
            },
            national: {
                type: Boolean,
                required: true
            },
            logo: {
                type: String,
                required: true
            }
        },
        required: true
    },
    venue: {
        type: {
            id: {
                type: Number,
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            capacity: {
                type: Number,
                required: true
            },
            surface: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        }
    }
})

export default mongoose.model('Team', teamSchema)