import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashpassword = async (passowrd) => {
    return bcrypt.hash(passowrd,SALT_ROUNDS);
};

export const comparePassword = async (passowrd,hashpassword) => {
    return bcrypt.compare(passowrd,hashpassword);
}