import { createAuthClient } from "better-auth/react";
import { BACKEND_API_URL, USER_ROLES } from "../constants";

export const authClient = createAuthClient({
    baseURL: `${BACKEND_API_URL}/auth`,
    user: {
        additionalFields: {
            role: {
                type: USER_ROLES,
                required: true,
                defaultValue: "student",
                input: true,
            },
            department: {
                type: "string",
                required: false,
                input: true,
            },
            imageCldPubId: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
});