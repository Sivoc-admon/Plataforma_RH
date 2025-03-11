const mongoose = require('mongoose');

const teamsSchema = new mongoose.Schema({
    jefeInmediatoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'usuarios',
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} no es un ObjectId válido.`
        }
    },
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
