const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    playerId: {
        type: Number,
        required: true
    },
    name: {
        first: {
            type: String,
            required: true
        }, 
        last: {
            type: String,
            required: true
        },
        display: {
            type: String,
            required: true
        }
    },
    age: {
        type: Number,
        required: true
    }, 
    birth: {
        date: {
            type: String,           //TODO: Make sure to add proper pattern such as "2001-09-05"
            required: true
        },
        place: {
            type: String,
            required: true
        }, 
        country: {
            type: String,
            required: true
        }
    },
    nationality: {
        type: String,
        required: true
    }, 
    height: {
        metric: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    weight: {
        metric: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    },
    number: {
        type: Number,
        required: true
    },
    position: {
        type: String,       //TODO: Make sure to add specific positions as a restriction
        required: true
    }
}) 