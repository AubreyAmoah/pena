//const { PrismaClient } = require('@prisma/client');
const { PrismaClient } = require("../../prisma/generated/client");
const argon = require('argon2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const prisma = new PrismaClient();

dotenv.config({ path: './.env'});
module.exports = {
    me : async (req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },

                include: {
                    items: true,
                    roles: true,
                    Sales: true
                }
            })
            
            delete user.password;

            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({
                success: 0,
                data: 'Database Error'
            })
        }
    },

    getUsers : async (req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id
        
        try {
            const users = await prisma.user.findMany({
                include: {
                    roles: true,
                    Sales: true
                }

            })

            if (users) delete users.password; return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({
                success: 0,
                data: error
            })
        }
    },

    getUser : async (req,res) => {
        const { id } = req.params;

        const userId = parseInt(id);

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id : userId
                },
                include: {
                    roles: true,
                    Sales: true
                }
            })

            if (user) return res.status(200).json(user)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: 0,
                data: 'An error ocurred'
            })
        }
    },

    addItem : async(req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;
        let { name, price, stock,} = req.body

        const itemExists = await prisma.item.findUnique({
            where: {
                name
            }
        })

        const userRole = await prisma.role.findFirst({
            where: {
                role: 'super',
                userId
            }
        })

        if(!(userRole)) return res.status(401).json({msg:'You are not allowed To perform this Operation'})

        if(itemExists) return res.status(401).json({msg:'Item already exists'});

        const available = stock > 0 ? true : false
        try {
            const newItem = await prisma.item.create({
                data: {
                    name,
                    price,
                    stock,
                    available,
                    authorId: userId,
                }
            });

            if(newItem) return res.status(201).json({
                success: 1,
                data: 'Item added succesfilly'
            })
        } catch (error) {
            return res.status(500).json({
                success: 0,
                data: 'Failed to create Item',
                error
            })
        }
    },

    addUser : async(req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;
        let { username } = req.body

        const userExists = await prisma.user.findFirst({
            where: {
                username
            }
        })

        const userRole = await prisma.role.findFirst({
            where: {
                role: 'super',
                userId
            }
        })

        if(!(userRole)) return res.status(401).json({msg:'You are not allowed To perform this Operation'})

        if(userExists) return res.status(401).json({msg:'User already exists'});
        try {
            const hash = await argon.hash(`${username}${process.env.CODE}`);
            const newUser = await prisma.user.create({
                data: {
                    username,
                    password: hash,
                }
            });

            if(newUser){
                try {
                    await prisma.role.create({
                        data: {
                            role: 'guest'.toLocaleLowerCase().trim(),
                            canEdit: false,
                            canSell: true,
                            canDelete: false,
                            canRevoke: false,
                            canMonitor: false,
                            userId: newUser.id,
                        }
                    })
                } catch (error) {
                    return res.status(500).json({
                        success: 0,
                        data: 'An Error Occurred in creating User Role',
                        error
                    })
                }

                return res.status(201).json({
                    success: 1,
                    data: 'User Registration success!!'
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: 0,
                data: 'Failed to create User'
            })
        }
    },


    updateItem : async(req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;
        let { id, name, price, stock,} = req.body

        const itemExists = await prisma.item.findUnique({
            where: {
                id
            }
        })

        const userRole = await prisma.role.findFirst({
            where: {
                role: 'super',
                userId
            }
        })

        if(!(userRole)) return res.status(401).json({msg:'You are not allowed To perform this Operation'})

        if (itemExists) {
            const available = stock > 0 ? true : false
            const data = {};

            const currentDate = new Date();

            data.updatedAt = currentDate;

            if(name){
                data.name = name;
            }

            if(price){
                data.price = price;
            }

            if(stock){
                data.stock = stock;
            }

            data.available = available;

            console.log(data);

            try {
                const updatedItem = await prisma.item.update({
                    where:{
                        id
                    }, data
                });

                if(updatedItem) return res.status(201).json({
                    success: 1,
                    data: 'Item updated succesfully'
                })
            } catch (error) {
                return res.status(500).json({
                    success: 0,
                    data: 'Failed to update Item'
                })
            }
        }

        return res.status(401).json({
            success: 0,
            data: 'Item not found'
        })
    },
    sellItem : async(req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;
        let { id, quantity, totalPrice } = req.body;

        const itemExists = await prisma.item.findUnique({
            where: {
                id
            }
        })

        if (itemExists) {
            if (itemExists.stock >= quantity) {

                totalPrice = parseFloat(itemExists.price * quantity);
                try {
                    const newSale = await prisma.sales.create({
                        data: {
                            sellerId: userId,
                            itemId: id,
                            Quantity: totalPrice,
                        }
                    });
        
                    if(newSale) return res.status(201).json({
                        success: 1,
                        data: 'Item sale succesful'
                    })
                } catch (error) {
                    return res.status(500).json({
                        success: 0,
                        data: 'Item sale failed'
                    })
                }
            }
        }

        return res.status(401).json({
            success: 0,
            data: 'Item not found'
        })
    },
    deleteItem : async(req, res) => {
        const decoded = req.decoded;
        const userId = decoded.payload.user.id;
        let { id } = req.body;

        const itemExists = await prisma.item.findUnique({
            where: {
                id
            }
        })

        const userRole = await prisma.role.findFirst({
            where: {
                role: 'super',
                userId
            }
        })

        if(!(userRole)) return res.status(401).json({msg:'You are not allowed To perform this Operation'})

        if (itemExists) {
            try {
                const deleteItem = await prisma.item.delete({
                    where:{
                        id
                    }
                });

                if(deleteItem) return res.status(201).json({
                    success: 1,
                    data: 'Item deleted succesfully'
                })
            } catch (error) {
                return res.status(500).json({
                    success: 0,
                    data: 'Failed to delete Item'
                })
            }
        }

        return res.status(401).json({
            success: 0,
            data: 'Item not found'
        })
    }
}