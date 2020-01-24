const User = require("../models/user");

exports.getAll = async (request, response) => {
    try {
        const list = await User.find();
        response.status(200).send(list);
    } catch (error) {
        response.status(500).send("Erro:", error);
    }
}
exports.getOne = async (request, response) => {
    try {
        const one = await User.find({ name: request.body.name });
        response.status(200).send(one);
    } catch (error) {
        response.status(500).send("Erro:", error);
    }
}
exports.createOne = async (request, response) => {
    try {
        const newUser = new User({
            name: request.body.name,
            email: request.body.email,
            age: request.body.age,
        });
        await newUser.save()
        response.status(201).send(one);
    } catch (error) {
        response.status(500).send("Erro:", error);
    }
}
exports.updateOne = async (request, response) => {
    try {
        const oneUser = await User.findOneAndUpdate({ name: request.body.name },{ age: request.body.age });
        response.status(200).send(oneUser);
    } catch (error) {
        response.status(500).send("Erro:", error);
    }
}
exports.deleteOne = async (request, response) => {
    try {
        await oneUser.deleteOne({ name: request.body.name })
        response.status(200).send(oneUser);
    } catch (error) {
        response.status(500).send("Erro:", error);
    }
}