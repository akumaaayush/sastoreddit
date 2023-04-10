import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'The username length must be greater than 4'
            },
        ]

    }
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'The email is invalid!'
            },
        ];
    }

    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'Username cannot include an \'@\' sign!'
            },
        ];
    }

    if (options.password.length <= 4) {
        return [
            {
                field: 'password',
                message: 'The password length must be greater than 4'
            },
        ];
    }

    return null;
}