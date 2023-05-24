const dotEnv = require('dotenv');

const ProductModel = require('../../models/administrator/product.model');

dotEnv.config();

exports.createProduct = async (req, res) => {

    const productData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(productData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create product.' });

    let { productName, description } = productData;

    const productResult = await ProductModel.create({
        productName,
        description,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if ('id' in productResult)
        return res.json({ status: 200, message: 'Product created successfully.' });
    else
        return res.json({ status: 202, err: productResult, message: 'Couldnt assiged auth details to the product.' });

}

exports.getProducts = async (req, res) => {

    let offset = 'offset' in req.query ? (parseInt(req.query.offset) > 0 ? parseInt(req.query.offset) : 1) : 1;
    let limit = 'limit' in req.query ? (parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 9999) : 9999;
    offset = (offset - 1) * limit;

    const products = await ProductModel.findAndCountAll({ where: { isDeleted: 0 }, offset: offset, limit: limit }).then(products => products).catch(error => error);

    if (products)
        return res.json({ status: 200, message: 'Products data is in products node.', data: products });
    else
        return res.json({ status: 201, message: products });


}

exports.updateProduct = async (req, res) => {

    const productData = req.body.data;
    const todaysDate = new Date();

    if (Object.keys(productData).length <= 0)
        return res.json({ status: 201, message: 'No data provided to create product.' });

    let {id, productName, description } = productData;

    const productResult = await ProductModel.update({
        productName,
        description,
        createdAt: todaysDate,
        updatedAt: todaysDate
    }, { where: { id } }).then(result => {
        return result;
    }).catch(error => {
        return error;
    })

    if (productResult)
        return res.json({ status: 200, message: 'Product updated successfully.' });
    else
        return res.json({ status: 202, message: productResult })

}

exports.removeProduct = async (req, res) => {

    const product_id = req.query.id;
    const created_at = new Date();
    const isDeleted = 1;

    ProductModel.findOne({ where: { id: product_id } }).then(result => {

        ProductModel.update({
            isDeleted: isDeleted,
        }, { where: { id: product_id } }).then(result => {
            return res.json({
                status: 200,
                message: 'Product removed successfully!'
            });    
        }).catch(error => {
            return res.json({
                status: 500,
                message: error
            });
        });
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
}


exports.getProductsByorderType = async (req, res) => {
    const OrderType = req.query.orderType;
    
    ProductModel.findAndCountAll({ where: { orderType : OrderType } }).then(result => {
        console.log(result, "rrrrrrrrrrrrrrrrrrrreeeeeeeeeessssssssssssuuuuuuuuuuullllllllllllttttttttttttt")
        if(result.count == 0 ){
            return res.json({
                status: 200,
                message: 'product Not Found !'
            }); 
        }else{
            return res.json({
                status: 200,
                message: 'product Found successfully!',
                data: result
                
            }); 
        }
        
    }).catch(error => {
        return res.json({
            status: 500,
            message: error
        });
    });
}