const Product = require('../models/ProdutctSchema');
const Barbershop = require('../models/BarbershopSchema');

const createProduct = async (req, res) => {
    try {
        const { name, description, barbershop, price, stock } = req.body;

        const existingBarbershop = await Barbershop.findById(barbershop);

        if (!existingBarbershop) {
            return res.status(404).json({ message: 'Barbearia não encontrada' });
        }
        
        const newProduct = new Product({ name, description, barbershop, price, stock });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
};

const getProducts = async (req, res) => {
    try {
        const { barbershop } = req.params;

        const retrievedProducts = await Product.find({ barbershop: barbershop });

        if (!retrievedProducts || retrievedProducts.length === 0) {
            return res.status(404).json({ error: 'Nenhum produto encontrado para essa barbearia' });
        }

        res.status(200).json(retrievedProducts);
    } catch (error) {
        
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        // Search and delete by ID
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.status(200).json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o produto' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, barbershop, price, stock } = req.body;

    try {
        // Search and update product by ID
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, description, barbershop, price, stock },
            { new: true, runValidators: true } // Returns the updated document and applies validations
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o produto' });
    }
};



module.exports = {
    createProduct,
    getProducts,
    deleteProduct,
    updateProduct
}