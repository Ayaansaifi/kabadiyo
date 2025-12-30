
import { db } from "./src/lib/db";

async function main() {
    const user = await db.user.findFirst({
        where: {
            referralCode: "TEST"
        }
    });
    console.log(user);
}
