const mongoose = require('mongoose')

const Schema = mongoose.Schema
const City = new Schema({
  id: {
    type: String,
    require: true
  },
  value: {
    type: Array,
    require: true
  }
})

module.exports = mongoose.model('City', City)
