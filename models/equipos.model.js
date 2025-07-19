const mongoose = require('mongoose');


//from
// const team = await teamsSchema.find({ jefeInmediatoId: res.locals.userId }).select('-__v');
//to
// const team = await teamsSchema.find({ jefeInmediatoIds: { $in: [res.locals.userId] } }).select('-__v');


const teamsSchema = new mongoose.Schema({
    jefeInmediatoIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} no es un ObjectId válido.`
        }
    }],
    colaboradoresIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} no es un ObjectId válido.`
        }
    }]
});

module.exports = mongoose.model('equipos', teamsSchema);