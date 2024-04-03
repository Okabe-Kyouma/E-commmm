const mongoose = require('mongoose');

const productSchema =  mongoose.Schema({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    namee : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        require : true,
    },
    description : {
        type : String,
    },
    price : {
       type : Number,
       required : true,  
    },
    rating : {
        type : Number,
        required : true,
    }
})

const product = mongoose.model('e-com-products',productSchema);

module.exports = product;