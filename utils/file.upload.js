import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv();

export const processFile = async (file) => {
    try {
        const res = await axios.post(`${process.env.AI_MODEL_ADDRESS}/analysis`, file);
        return res.data;
    } catch (error) {
        return { error };
    }
}