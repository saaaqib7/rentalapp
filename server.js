const securePassword = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const expressFramework = require('express');
const mongooseDB = require('mongoose');

require('dotenv').config();

const expressApp = expressFramework();
const SERVER_PORT = 1900;

expressApp.use(expressFramework.json());

mongooseDB.connect('mongodb+srv://saaaqib:*1234567*cluster0.5zaym3a.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const CustomProduct = mongooseDB.model('CustomProduct', {
    customName: String,
    customDescription: String,
    customPrice: Number,
});

const CustomUser = mongooseDB.model('CustomUser', {
    customUsername: String,
    customEmail: String,
    customPassword: String,
});

expressApp.post('/register', async (req, res) => {
    const { customUsername, customEmail, customPassword } = req.body;

    const errors = validationResult(req); // Changed 'checkValidation' to 'validationResult'
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingUser = await CustomUser.findOne({
            $or: [{ customUsername }, { customEmail }],
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'The provided username or email is already in use' });
        }

        const hashedPassword = await securePassword.hash(customPassword, 10);

        const newCustomUser = new CustomUser({
            customUsername,
            customEmail,
            customPassword: hashedPassword,
        });

        await newCustomUser.save();

        res
            .status(201)
            .json({ message: 'User registration has been successfully completed' });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({
                error:
                    "Unexpected Error has Transpired within the Server's Internal Processes",
            });
    }
});

const verifyUser = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res
            .status(401)
            .json({ error: 'Access denied - Authentication token not supplied' });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.customUserId = decoded.customUserId;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};

expressApp.post('/login', async (req, res) => {
    const { customUsername, customPassword
    } = req.body;

    try {
        const customUser = await CustomUser.findOne({
            customUsername
        });
        if (!customUser) {
            return res.status(404).json({
                error: 'The specified user could not be located'
            });
        }

        const passwordMatch = await securePassword.compare(customPassword, customUser.customPassword);
        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid password'
            });
        }
        const token = jsonwebtoken.sign({
            customUserId: customUser._id
        }, 'custom_secret_key');
        res.json({
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});


expressApp.get('/products', async (req, res) => {
    try {
        const customProducts = await CustomProduct.find();
        res.json(customProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.get('/product/:customProductId', async (req, res) => {
    const customProductId = req.params.customProductId;

    try {
        const customProduct = await CustomProduct.findById(customProductId);
        if (!customProduct) {
            return res.status(404).json({
                error: 'The requested product could not be located'
            });
        }

        res.json(customProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});


expressApp.put('/cart', verifyUser, async (req, res) => {
    const { customUserId, customProductId
    } = req.body;

    try {

        res.json({
            message: 'The addition/removal of the item from the cart was executed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.put('/wishlist', verifyUser, async (req, res) => {
    const { customUserId, customProductId
    } = req.body;

    try {

        res.json({
            message: 'Item successfully added to or removed from your wishlist'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.post('/initiate-order', verifyUser, async (req, res) => {
    const { customUserId
    } = req.body;

    try {

        res.json({
            message: 'Order successfully initiated'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.get('/user/:customUsername', async (req, res) => {
    const customUsername = req.params.customUsername;

    try {
        const customUser = await CustomUser.findOne({
            customUsername
        });
        if (!customUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json(customUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.put('/modify-product', async (req, res) => {
    const { customProductId, updatedProductData
    } = req.body;

    try {

        res.json({
            message: 'Successfully updated the Product Details'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.put('/user', verifyUser, async (req, res) => {
    const { customUserId, updatedUserData
    } = req.body;

    try {

        res.json({
            message: 'User information successfully modified'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });

    }
});

expressApp.post('/create-product', async (req, res) => {
    const { customName, customDescription, customPrice
    } = req.body;

    try {
        const newCustomProduct = new CustomProduct({
            customName,
            customDescription,
            customPrice,
        });

        await newCustomProduct.save();

        res.status(201).json({
            message: 'Successfully created the product'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected Error has Transpired within the Server's Internal Processes" });


    }
});



expressApp.listen(SERVER_PORT, () => {
    console.log(`Server is running on http: //localhost:${SERVER_PORT}`);
});
