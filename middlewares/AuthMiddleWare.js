import User from "../models/User/User.model.js";

export const protect = async (req, res, next) => {

    next();
}

export const protectUser = async (req, res, next) => {

}